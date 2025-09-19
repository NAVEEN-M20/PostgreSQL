import React, { useEffect, useState, useContext, useCallback } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import { UserContext } from "./UserContext";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const NAVBAR_HEIGHT = 64; 
let socket;

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("sidebar"); // "sidebar" or "chat"
  const [unreadCounts, setUnreadCounts] = useState({});
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Initialize socket connection
  useEffect(() => {
    if (!socket && user) {
      socket = io(API_URL, { 
        withCredentials: true,
        path: "/socket.io/",
      });

      socket.on("unreadCounts", (counts) => {
        setUnreadCounts(counts);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setUsers([]);
      return;
    }
    
    try {
      const res = await axios.get(`${API_URL}/api/users`, {
        withCredentials: true,
      });
      setUsers(res.data);
      
      // Register with socket for real-time updates
      if (socket) {
        socket.emit("register", user.id);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) setView("chat");
    
    // Reset unread count for this user
    setUnreadCounts(prev => ({
      ...prev,
      [user.id]: 0
    }));
    
    // Mark messages as read on server
    if (socket) {
      socket.emit("markAsRead", {
        senderId: user.id,
        receiverId: user.id // Current user is the receiver
      });
    }
  };

  const handleBack = () => {
    setView("sidebar");
  };

  const markAsRead = useCallback((userId) => {
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: 0
    }));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        position: "absolute",
        top: NAVBAR_HEIGHT,
        left: 0,
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        width: "100vw",
        overflow: "hidden",
        background: "#ece5dd",
      }}
    >
      {(view === "sidebar" || !isMobile) && (
        <ChatSidebar
          users={users}
          onSelect={handleSelectUser}
          selectedUser={selectedUser}
          isMobile={isMobile}
          unreadCounts={unreadCounts}
        />
      )}
      {(view === "chat" || !isMobile) && (
        <ChatWindow
          currentUser={user}
          otherUser={selectedUser}
          onBack={handleBack}
          isMobile={isMobile}
          markAsRead={markAsRead}
          socket={socket}
        />
      )}
    </Box>
  );
};

export default React.memo(Chat);