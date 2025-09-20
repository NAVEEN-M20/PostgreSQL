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
import { io } from "socket.io-client";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const socketRef = { current: null };

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

const ChatWindow = ({ currentUser, otherUser, onBack, isMobile }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesRef = useRef(null);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

  // Init socket once
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(API_URL, { withCredentials: true });

      socketRef.current.on("receiveMessage", (msg) =>
        setMessages((prev) => [...prev, msg])
      );
      socketRef.current.on("messageSent", (msg) =>
        setMessages((prev) => [...prev, msg])
      );
      socketRef.current.on("connect_error", (err) =>
        console.error("Socket error:", err)
      );
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Register user with socket
  useEffect(() => {
    if (currentUser && socketRef.current) {
      if (!socketRef.current.connected) socketRef.current.connect();
      socketRef.current.emit("register", currentUser.id);
    }
  }, [currentUser]);

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
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [otherUser, currentUser]);

  // Auto-scroll
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !otherUser || !currentUser) return;
    socketRef.current.emit("sendMessage", {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      message: text,
    });
    setText("");
  };

  const groupedMessages = groupMessagesByDate(messages);

  return !otherUser ? (
    <Box
      sx={{ flex: 1, alignItems: "center", justifyContent: "center", display: "flex" }}
    >
      <Typography>Select a user to start chatting</Typography>
    </Box>
  ) : (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ece5dd",
        minWidth: 0,
      }}
    >
      {/* Header */}
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

      {/* Messages */}
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
          const mine =
            m.sender_id === currentUser?.id || m.senderId === currentUser?.id;
          const isTaskCompleted =
            m.message && m.message.includes("completed!!");

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
                  bgcolor: isTaskCompleted
                    ? "linear-gradient(90deg, #4caf50 0%, #2e7d32 50%, #1b5e20 100%)"
                    : mine
                    ? "#6a11cb"
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
                      color: isTaskCompleted ? "#e0e0e0" : "#999",
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    {mine ? currentUser?.name : otherUser?.name} •{" "}
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
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey
              ? (e.preventDefault(), sendMessage())
              : null
          }
          sx={{
            background: "#fff",
            borderRadius: 2,
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
              background:
                "linear-gradient(90deg, #1b47ae 0%, #571e96 100%)",
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