import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const groupMessagesByDate = (messages) => {
  const grouped = [];
  let currentDate = null;

  messages.forEach((m) => {
    const msgDate = new Date(m.created_at || new Date()).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      grouped.push({ type: "date", date: m.created_at || new Date(), id: `date-${currentDate}` });
    }
    grouped.push(m);
  });

  return grouped;
};

const ChatWindow = ({ 
  currentUser, 
  otherUser, 
  onBack, 
  isMobile, 
  socket, 
  setLastMessageTimestamps,
  updateLastMessage,
}) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);
  const inputBarRef = useRef(null);
  const inputRef = useRef(null);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
  const [inputBarHeight, setInputBarHeight] = useState(72);

  // Mark as read when user is selected
  useEffect(() => {
    if (otherUser && currentUser && socket) {
      // Check if there are any unread messages from this user
      const hasUnreadMessages = messages.some(
        msg => msg.sender_id === otherUser.id && !msg.is_read
      );
      
      if (hasUnreadMessages) {
        console.log("📖 Auto-marking messages as read");
        socket.emit("markAsRead", {
          senderId: otherUser.id,
          receiverId: currentUser.id,
        });
      }
    }
  }, [otherUser, currentUser, socket]);

  // OPTIMIZED: Simplified socket message handling
  useEffect(() => {
    if (!socket || !otherUser) return;

    const handleReceiveMessage = (msg) => {
      console.log("📨 ChatWindow received message:", msg);
      
      // Only process messages relevant to current conversation
      if ((msg.sender_id === otherUser.id || msg.receiver_id === otherUser.id) && 
          !messages.some(m => m.id === msg.id)) {
        
        setMessages(prev => [...prev, msg]);
        updateLastMessage(msg, otherUser.id);

        // Auto-mark as read if message is from other user
        if (msg.sender_id === otherUser.id) {
          socket.emit("markAsRead", { 
            senderId: otherUser.id, 
            receiverId: currentUser.id 
          });
        }
      }
    };

    const handleMessageSent = (msg) => {
      console.log("📤 ChatWindow message sent:", msg);
      if (!messages.some(m => m.id === msg.id)) {
        setMessages(prev => [...prev, msg]);
        updateLastMessage(msg, otherUser.id);
      }
    };

    // Handle read receipts for both sent and received messages
    const handleMessagesRead = (data) => {
      console.log("✅ Messages read update:", data);
      
      setMessages(prev => prev.map(msg => {
        // Handle both new format (messageIds array) and legacy format (messageId)
        const isRead = (data.messageIds && data.messageIds.includes(msg.id)) || 
                      (data.messageId && data.messageId === msg.id);
        
        if (isRead) {
          return { ...msg, is_read: true };
        }
        return msg;
      }));

      // Force sidebar update
      setLastMessageTimestamps(prev => ({
        ...prev,
        [otherUser.id]: Date.now()
      }));
    };

    // Set up all event listeners
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("messagesMarkedRead", handleMessagesRead);
    socket.on("messagesReadByReceiver", handleMessagesRead);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("messagesMarkedRead", handleMessagesRead);
      socket.off("messagesReadByReceiver", handleMessagesRead);
    };
  }, [socket, otherUser, currentUser, messages, updateLastMessage, setLastMessageTimestamps]);

  // OPTIMIZED: Faster message fetching with cancellation
  useEffect(() => {
    if (!otherUser || !currentUser) {
      setMessages([]);
      return;
    }

    let mounted = true;
    const abortController = new AbortController();

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/messages/${otherUser.id}`, {
          withCredentials: true,
          timeout: 8000, // Reduced timeout
          signal: abortController.signal,
        });
        
        if (!mounted) return;

        if (res.data && Array.isArray(res.data)) {
          setMessages(res.data);

          // Update last message timestamp
          if (res.data.length > 0) {
            const lastMsg = res.data[res.data.length - 1];
            const lastMsgDate = new Date(lastMsg.created_at).getTime();
            setLastMessageTimestamps((prev) => ({
              ...prev,
              [otherUser.id]: lastMsgDate,
            }));
          }
        } else {
          setMessages([]);
        }
      } catch (err) {
        if (mounted && err.name !== 'CanceledError') {
          console.error("Error fetching messages:", err);
          setMessages([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchMessages();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [otherUser, currentUser, setLastMessageTimestamps]);

  // OPTIMIZED: Input height measurement
  const measureInputHeight = useCallback(() => {
    try {
      const h = inputBarRef.current ? inputBarRef.current.offsetHeight : 72;
      setInputBarHeight(h);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    measureInputHeight();
    const onResize = () => {
      setTimeout(measureInputHeight, 120);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [measureInputHeight]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // OPTIMIZED: Input focus handling
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    
    const onFocus = () => {
      setTimeout(() => {
        try {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } catch (err) {
          console.log(err);
        }
      }, 120);
    };
    
    el.addEventListener("focus", onFocus, { passive: true });
    return () => el.removeEventListener("focus", onFocus);
  }, []);

  // OPTIMIZED: Send message function
  const sendMessage = useCallback(() => {
    if (!text.trim() || !otherUser || !currentUser || !socket) return;

    socket.emit("sendMessage", {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      message: text,
    });
    setText("");
  }, [text, otherUser, currentUser, socket]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // OPTIMIZED: Read receipt rendering with memoization
  const renderReadReceipt = useCallback((message) => {
    if (message.sender_id !== currentUser.id) return null;
    
    // Use the actual is_read property from the message
    if (message.is_read) {
      return <DoneAllIcon sx={{ fontSize: 16, color: "blue", ml: 0.5 }} />;
    } else {
      return <DoneIcon sx={{ fontSize: 16, color: "#999", ml: 0.5 }} />;
    }
  }, [currentUser.id]);

  const groupedMessages = groupMessagesByDate(messages);

  if (!otherUser) {
    return (
      <Box className="chat-window-bg" sx={{ flex: 1, alignItems: "center", justifyContent: "center", display: "flex" }}>
        <Typography color="text.secondary">Select a user to start chatting</Typography>
      </Box>
    );
  }

  return (
    <Box
      className="chat-window-bg"
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        minWidth: 0,
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 0,
          boxShadow: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
        }}
      >
        {(isMobile || isMobileView) && (
          <IconButton onClick={onBack} color="inherit" sx={{ mr: 1 }}>
            <ArrowBackIcon sx={{ color: "inherit" }} />
          </IconButton>
        )}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            mr: 2,
            fontSize: "1rem",
          }}
        >
          {otherUser?.name?.charAt(0).toUpperCase()}
        </Box>
        <Typography
          variant="h6"
          className="gradient-text"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
          }}
        >
          {otherUser?.name}
        </Typography>
      </Paper>

      <Box
        ref={messagesRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          background: "transparent",
          minHeight: 0,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          pb: `${inputBarHeight + 16}px`,
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <Typography color="text.secondary">Loading messages...</Typography>
          </Box>
        ) : groupedMessages.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <Typography color="text.secondary">No messages yet. Start a conversation!</Typography>
          </Box>
        ) : (
          groupedMessages.map((item) => {
            if (item.type === "date") {
              return (
                <Box key={item.id} sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      borderRadius: "20px",
                      px: 2,
                      py: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {formatDate(item.date)}
                    </Typography>
                  </Box>
                </Box>
              );
            }

            const m = item;
            const mine = m.sender_id === currentUser?.id;

            return (
              <Box
                key={m.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: mine ? "flex-end" : "flex-start",
                  mb: 1.5,
                }}
              >
                <Box
                  className={mine ? "chat-bubble-mine" : "chat-bubble-other"}
                  sx={{
                    maxWidth: "70%",
                    bgcolor: mine ? "#6a11cb" : "#fff",
                    color: mine ? "white" : "black",
                    px: 2,
                    py: 1,
                    borderRadius: mine ? "16px 0 16px 16px" : "0 16px 16px 16px",
                    boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography variant="body1">{m.message}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: mine ? "#e0e0e0" : "#999" }}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                    {mine && renderReadReceipt(m)}
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Box
        ref={inputBarRef}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 2,
          background: "transparent",
          borderTop: "1px solid #ddd",
          position: "sticky",
          bottom: 0,
          zIndex: 2,
        }}
      >
        <TextField
          inputRef={inputRef}
          placeholder="Type a message"
          multiline
          fullWidth
          maxRows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            "& .MuiOutlinedInput-root": { borderRadius: 24 },
          }}
        />
        <Button
          onClick={sendMessage}
          variant="contained"
          disabled={!text.trim()}
          sx={{
            minWidth: 48,
            minHeight: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
            "&:hover": {
              background: "linear-gradient(90deg, #1b47ae 0%, #571e96 100%)",
            },
            borderRadius: "50%",
            "&:disabled": {
              background: "#ccc",
            },
          }}
        >
          <SendIcon sx={{ color: "white", fontSize: 20 }} />
        </Button>
      </Box>
    </Box>
  );
};

export default memo(ChatWindow);