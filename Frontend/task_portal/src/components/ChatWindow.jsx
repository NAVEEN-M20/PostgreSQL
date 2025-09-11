import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, TextField, Button, Paper, Divider } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SendIcon from '@mui/icons-material/Send';
import { io } from "socket.io-client";
const API_URL = import.meta.env.VITE_API_URL;

let socket;

const ChatWindow = ({ currentUser, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesRef = useRef(null);

  useEffect(() => {
    if (!socket && currentUser) {
      socket = io(API_URL, { withCredentials: true });
    }
    if (!socket) return;
    const onReceive = (message) => setMessages((prev) => [...prev, message]);
    const onMessageSent = (message) => setMessages((prev) => [...prev, message]);
    socket.on("receiveMessage", onReceive);
    socket.on("messageSent", onMessageSent);
    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("messageSent", onMessageSent);
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && socket) {
      socket.emit("register", currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!otherUser || !currentUser) {
        setMessages([]);
        return;
      }
      const res = await fetch(`${API_URL}/api/messages/${otherUser.id}`, { credentials: "include" });
      const data = await res.json();
      setMessages(data || []);
    };
    fetchMessages();
  }, [otherUser, currentUser]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !otherUser || !currentUser) return;
    const payload = {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      message: text,
    };
    socket.emit("sendMessage", payload);
    setText("");
  };

  if (!otherUser) {
    return (
      <Paper sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Typography color="text.secondary">Select a user to start chatting</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, height: "100%" }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <AccountCircleIcon sx={{ mr: 1 }} />
        <Typography variant="h6">
          {otherUser.name || otherUser.email}
        </Typography>
      </Box>
      <Divider />
      <Box ref={messagesRef} sx={{ flex: 1, overflowY: "auto", my: 2, pr: 1 }}>
        {messages.map((m, i) => {
          const mine = m.sender_id === currentUser?.id;
          return (
            <Box key={i} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", mb: 1 }}>
              <Box sx={{ px: 1.5, py: 1, borderRadius: 2, maxWidth: "70%", bgcolor: mine ? "primary.main" : "grey.200", color: mine ? "primary.contrastText" : "text.primary" }}>
                <Typography variant="body2">{m.message}</Typography>
                {m.created_at && (
                  <Typography variant="caption" sx={{ opacity: 0.7, display: "block", textAlign: mine ? "right" : "left", fontSize: "0.7rem" }}>
                    {new Date(m.created_at).toLocaleDateString()} {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button variant="contained" onClick={sendMessage} endIcon={<SendIcon />} sx={{ minWidth: 90, justifyContent: 'flex-end' }}>
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatWindow;
