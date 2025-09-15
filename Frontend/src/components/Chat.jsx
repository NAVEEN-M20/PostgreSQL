import React, { useEffect, useState, useContext } from "react";
import { Box, Paper } from "@mui/material";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import { UserContext } from "./UserContext";
const API_URL = import.meta.env.VITE_API_URL;

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    // fetch users only after user is loaded (so backend can authorize)
    if (!user) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users`, { withCredentials: true });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [user]);

  return (
    <Box display="flex">
      <ChatSidebar users={users} onSelect={setSelectedUser} selectedUser={selectedUser} />
      <Box flex={1} px={2}>
        <ChatWindow currentUser={user} otherUser={selectedUser} />
      </Box>
    </Box>
  );
};

export default Chat;
