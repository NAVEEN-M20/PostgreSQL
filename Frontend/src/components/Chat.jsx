import React, { useEffect, useState, useContext, useCallback } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import { UserContext } from "./UserContext";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("sidebar"); // "sidebar" or "chat"
  const [unreadCounts, setUnreadCounts] = useState({});
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [socket, setSocket] = useState(null);

  // Calculate height considering navbar (assuming navbar is around 64px)
  const navbarHeight = 64;
  const chatHeight = `calc(100vh - ${navbarHeight}px)`;

  // Initialize socket connection
  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(API_URL, { 
        withCredentials: true,
        path: "/socket.io/",
      });

      newSocket.on("unreadCounts", (counts) => {
        setUnreadCounts(counts);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
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
  }, [user, socket]);

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
        receiverId: user.id
      });
    }
  };

  const handleBack = () => {
    setView("sidebar");
    setSelectedUser(null);
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
        height: chatHeight, // Use calculated height instead of 100vh
        width: "100%",
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
          height={chatHeight} // Pass height to ChatWindow
        />
      )}
    </Box>
  );
};

export default React.memo(Chat);