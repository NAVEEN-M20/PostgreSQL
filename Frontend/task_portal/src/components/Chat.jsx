import React, { useEffect, useState } from "react";
import { Box, Paper } from "@mui/material";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
const API_URL = import.meta.env.VITE_API_URL;

const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      const res = await fetch(`${API_URL}/api/users`, { credentials: "include" });
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, [user]);

  if (!user) return <Box p={4}>Login to use chat.</Box>;

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", p: 2 }}>
      <Paper sx={{ width: "30%", mr: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <ChatSidebar users={users} onSelect={setSelectedUser} selectedUser={selectedUser} />
      </Paper>
      <Box sx={{ flex: 1, height: "100%" }}>
        <ChatWindow currentUser={user} otherUser={selectedUser} />
      </Box>
    </Box>
  );
};

export default Chat;
