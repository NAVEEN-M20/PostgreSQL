// Chat.jsx
import React, { useEffect, useState } from "react";
import { Box, Paper } from "@mui/material";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const Chats = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current logged-in user (and tasks ignored)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
  const res = await axios.get(`${API_URL}/api/dashboard`, {
          withCredentials: true,
        });
        setCurrentUser(res.data.user || null);
      } catch (err) {
        console.error("Error fetching current user:", err);
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch users list (other users)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
  const res = await axios.get(`${API_URL}/api/users`, {
          withCredentials: true,
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  return (
  <Box sx={{ display: "flex", height: "calc(100vh - 64px)", p: 2 }}>
      {/* Sidebar */}
  <Paper sx={{ width: "30%", mr: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <ChatSidebar users={users} onSelect={setSelectedUser} selectedUser={selectedUser} />
      </Paper>

      {/* Chat Window */}
      <Box sx={{ flex: 1, height: "100%" }}>
        <ChatWindow currentUser={currentUser} otherUser={selectedUser} />
      </Box>
    </Box>
  );
};

export default Chats;
