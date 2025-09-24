import React, { useEffect, useState, useRef, memo } from "react";
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

const ChatWindow = ({ currentUser, otherUser, onBack, isMobile, socket }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesRef = useRef(null);
  const inputBarRef = useRef(null);
  const inputRef = useRef(null);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
  const [inputBarHeight, setInputBarHeight] = useState(72);

  // Mark messages as read when chat window is opened or otherUser changes
  useEffect(() => {
    if (otherUser && currentUser && socket) {
      socket.emit("markAsRead", {
        senderId: otherUser.id,
        receiverId: currentUser.id,
      });
    }
  }, [otherUser, currentUser, socket]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);

      // If this message is from the current chat user, mark it as read immediately
      if (otherUser && msg.sender_id === otherUser.id) {
        socket.emit("markAsRead", {
          senderId: otherUser.id,
          receiverId: currentUser.id,
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSent", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSent", handleReceiveMessage);
    };
  }, [otherUser, currentUser, socket]);

  // Fetch messages when otherUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!otherUser || !currentUser) {
        setMessages([]);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/api/messages/${otherUser.id}`, {
          withCredentials: true,
        });
        setMessages(res.data || []);

        // Mark messages as read after fetching
        if (socket) {
          socket.emit("markAsRead", {
            senderId: otherUser.id,
            receiverId: currentUser.id,
          });
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [otherUser, currentUser, socket]);

  const measureInputHeight = () => {
    try {
      const h = inputBarRef.current ? inputBarRef.current.offsetHeight : 72;
      setInputBarHeight(h);
    } catch (e) {
      console.log(e);
    }
  };

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
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Keep input visible when mobile keyboard opens
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onFocus = () => {
      setTimeout(() => {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err){
          console.log(err);
        }
      }, 120);
    };
    el.addEventListener('focus', onFocus, { passive: true });
    return () => el.removeEventListener('focus', onFocus);
  }, []);

  const sendMessage = () => {
    if (!text.trim() || !otherUser || !currentUser || !socket) return;

    socket.emit("sendMessage", {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      message: text,
    });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (!otherUser) {
    return (
      <Box sx={{ flex: 1, alignItems: "center", justifyContent: "center", display: "flex" }}>
        <Typography>Select a user to start chatting</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ece5dd",
        minWidth: 0,
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 0,
          boxShadow: "none",
          background: "#fff",
          display: "flex",
          alignItems: "center",
        }}
      >
        {(isMobile || isMobileView) && (
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
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
          background: "#f7f7f7",
          minHeight: 0,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          pb: `${inputBarHeight + 16}px`,
        }}
      >
        {groupedMessages.map((item) => {
          if (item.type === "date") {
            return (
              <Box key={item.id} sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <Box sx={{ backgroundColor: "rgba(0, 0, 0, 0.1)", borderRadius: "20px", px: 2, py: 0.5 }}>
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
                <Typography variant="caption" sx={{ color: mine ? "#e0e0e0" : "#999", display: "block", mt: 0.5 }}>
                  {mine ? currentUser?.name : otherUser?.name} • {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box
        ref={inputBarRef}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 2,
          background: "#f0f0f0",
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
          }}
        >
          <SendIcon sx={{ color: "white", fontSize: 20 }} />
        </Button>
      </Box>
    </Box>
  );
};

export default memo(ChatWindow);
