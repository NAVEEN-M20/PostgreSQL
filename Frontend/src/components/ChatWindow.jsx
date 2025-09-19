import React, { useEffect, useState, useRef, memo } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Format dates WhatsApp-style
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

// Group messages by date
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

const ChatWindow = ({ currentUser, otherUser, onBack, isMobile, markAsRead, socket }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (msg) => {
        // Only add message if it's for the current conversation
        if ((msg.sender_id === otherUser?.id && msg.receiver_id === currentUser?.id) ||
            (msg.sender_id === currentUser?.id && msg.receiver_id === otherUser?.id)) {
          setMessages(prev => [...prev, msg]);
        }
      };

      socket.on("receiveMessage", handleReceiveMessage);
      
      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [socket, currentUser, otherUser]);

  // Fetch messages when otherUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!otherUser || !currentUser) {
        setMessages([]);
        return;
      }
      try {
        const res = await axios.get(
          `${API_URL}/api/messages/${otherUser.id}`,
          { withCredentials: true }
        );
        setMessages(res.data || []);
        
        // Mark messages as read when opening a conversation
        if (res.data && res.data.length > 0 && markAsRead && socket) {
          markAsRead(otherUser.id);
          socket.emit("markAsRead", {
            senderId: otherUser.id,
            receiverId: currentUser.id
          });
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [otherUser, currentUser, markAsRead, socket]);

  const sendMessage = () => {
    if (!text.trim() || !otherUser || !currentUser || !socket) return;
    socket.emit("sendMessage", {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      message: text,
    });
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return !otherUser ? (
    <Box
      sx={{ 
        flex: 1, 
        alignItems: "center", 
        justifyContent: "center", 
        display: "flex",
        background: "#ece5dd",
      }}
    >
      <Typography>Select a user to start chatting</Typography>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#ece5dd",
      }}
    >
      {/* Header with AppBar for proper mobile navigation */}
      <AppBar 
        position="static" 
        elevation={1}
        sx={{ 
          backgroundColor: "white",
          color: "text.primary",
        }}
      >
        <Toolbar>
          {(isMobile || isMobileView) && (
            <IconButton
              edge="start"
              onClick={onBack}
              sx={{ mr: 2, color: "primary.main" }}
            >
              <ArrowBackIcon />
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
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {otherUser?.name}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          background: "inherit",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {groupedMessages.map((item) => {
          if (item.type === "date") {
            return (
              <Box
                key={item.id}
                sx={{ display: "flex", justifyContent: "center", my: 2 }}
              >
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
          const isTaskCompleted = m.message && m.message.includes("completed!!");

          return (
            <Box
              key={m.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isTaskCompleted
                  ? "center"
                  : mine
                  ? "flex-end"
                  : "flex-start",
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  background: isTaskCompleted
                    ? "linear-gradient(90deg, #4caf50 0%, #2e7d32 50%, #1b5e20 100%)"
                    : mine
                    ? "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)"
                    : "#fff",
                  color: isTaskCompleted ? "white" : mine ? "white" : "black",
                  px: 2,
                  py: 1,
                  borderRadius: isTaskCompleted
                    ? "16px"
                    : mine
                    ? "16px 0 16px 16px"
                    : "0 16px 16px 16px",
                  boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                  wordBreak: "break-word",
                }}
              >
                <Typography variant="body1">
                  {m.message || m.content}
                </Typography>
                {!isTaskCompleted && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: isTaskCompleted ? "#e0e0e0" : mine ? "rgba(255,255,255,0.7)" : "#999",
                      display: "block",
                      mt: 0.5,
                      textAlign: "right",
                    }}
                  >
                    {m.created_at
                      ? new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 2,
          background: "#f0f0f0",
          borderTop: "1px solid #ddd",
        }}
      >
        <TextField
          placeholder="Type a message"
          multiline
          fullWidth
          maxRows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          sx={{
            background: "#fff",
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            "& .MuiOutlinedInput-root": { borderRadius: 24 },
          }}
        />
        <IconButton
          onClick={sendMessage}
          disabled={!text.trim()}
          sx={{
            minWidth: 48,
            minHeight: 48,
            background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
            "&:hover": {
              background: "linear-gradient(90deg, #1b47ae 0%, #571e96 100%)",
            },
            "&.Mui-disabled": {
              background: "#ccc",
            },
            borderRadius: "50%",
            color: "white",
          }}
        >
          <SendIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default memo(ChatWindow);