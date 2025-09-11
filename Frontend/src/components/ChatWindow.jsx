import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { io } from "socket.io-client";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

let socket;

const ChatWindow = ({ currentUser, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesRef = useRef(null);

  useEffect(() => {
    if (!socket) {
      socket = io(API_URL, { withCredentials: true });
      socket.on("receiveMessage", msg => setMessages(prev => [...prev, msg]));
      socket.on("messageSent", msg => setMessages(prev => [...prev, msg]));
      return () => {
        socket.off("receiveMessage");
        socket.off("messageSent");
      };
    }
  }, []);

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
      try {
        const res = await axios.get(`${API_URL}/api/messages/${otherUser.id}`, { withCredentials: true });
        setMessages(res.data || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
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
    socket.emit("sendMessage", {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      message: text,
    });
    setText("");
  };

  return !otherUser ? (
    <Typography>Select a user to start chatting</Typography>
  ) : (
    <Paper sx={{ p: 2, height: 480, display: "flex", flexDirection: "column" }}>
      <Typography variant="h6">{otherUser.name} ({otherUser.email})</Typography>
      <Box ref={messagesRef} sx={{
        flex: 1,
        overflowY: "auto",
        mt: 1,
        mb: 2,
        backgroundColor: "#fafafa",
        borderRadius: 1,
        p: 1
      }}>
        {messages.map((m, i) => {
          const mine = m.sender_id === currentUser?.id;
          return (
            <Box key={m.id || i} textAlign={mine ? "right" : "left"} mb={2}>
              <Typography variant="body2">{m.message}</Typography>
              <Typography variant="caption" color="textSecondary">
                {mine ? currentUser?.name : otherUser?.name} — {new Date(m.created_at).toLocaleTimeString()}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <TextField
        label="Type a message"
        multiline
        fullWidth
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), sendMessage()) : null}
        sx={{ mt: 1 }}
      />
      <Button onClick={sendMessage} sx={{ minWidth: 90, mt: 1, alignSelf: "flex-end" }} variant="contained">
        Send
      </Button>
    </Paper>
  );
};

export default ChatWindow;
