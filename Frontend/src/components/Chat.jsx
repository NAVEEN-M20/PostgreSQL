import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import { UserContext } from "./UserContext";
import { io } from "socket.io-client";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const NAVBAR_HEIGHT = 64; 

// Global socket instance to maintain single connection
let globalSocket = null;

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("sidebar");
  const [unreadCounts, setUnreadCounts] = useState({});
  const { user, setUser } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [socket, setSocket] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize socket connection once
  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(API_URL, {
        path: "/socket.io/",
        withCredentials: true,
        transports: ["polling", "websocket"],
      });

      globalSocket.on("connect", () => {
        console.log("✅ Socket connected");
        if (user?.id) {
          globalSocket.emit("register", user.id);
        }
      });

      globalSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      globalSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    }

    setSocket(globalSocket);

    return () => {
      // Don't disconnect - keep socket alive for app lifetime
    };
  }, []);

  // Register user with socket when user changes
  useEffect(() => {
    if (socket && user?.id) {
      socket.emit("register", user.id);
    }
  }, [socket, user]);

  // Socket event listeners for unread counts
  useEffect(() => {
    if (!socket) return;

    const handleUnreadCounts = (counts) => {
      console.log("📨 Received unread counts:", counts);
      setUnreadCounts(counts);
    };

    const handleReceiveMessage = (message) => {
      console.log("📩 New message received:", message);
      // Increment unread only if the conversation is not currently open
      if (message.sender_id && message.sender_id !== user?.id && message.sender_id !== selectedUser?.id) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.sender_id]: (prev[message.sender_id] || 0) + 1
        }));
      }
    };

    socket.on("unreadCounts", handleUnreadCounts);
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("unreadCounts", handleUnreadCounts);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, user, selectedUser]);

  // Viewport height handled globally in App.jsx

  // Fetch session, users, and initial unread counts
  useEffect(() => {
    let mounted = true;

    const fetchSessionAndUsers = async () => {
      try {
        // Always get session once here (simpler flow)
        const me = await axios.get(`${API_URL}/api/me`, { withCredentials: true });
        if (mounted && me?.data?.user && setUser) {
          setUser(me.data.user);
        }

        const activeUser = me?.data?.user;
        if (!activeUser) {
          if (mounted) {
            setUsers([]);
            setUnreadCounts({});
          }
          return;
        }

        // Fetch users and unread counts in parallel
        const [usersRes, unreadRes] = await Promise.all([
          axios.get(`${API_URL}/api/users`, { withCredentials: true }),
          axios.get(`${API_URL}/api/messages/unread-counts`, { withCredentials: true })
        ]);

        if (mounted) {
          setUsers(usersRes.data || []);
          setUnreadCounts(unreadRes.data || {});
          console.log("👥 Users loaded:", usersRes.data?.length);
          console.log("🔔 Initial unread counts:", unreadRes.data);
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
        if (mounted) {
          setUsers([]);
          setUnreadCounts({});
        }
      }
    };

    fetchSessionAndUsers();

    return () => {
      mounted = false;
    };
  }, [setUser]);

  const handleSelectUser = (selectedUser) => {
    console.log("👤 User selected:", selectedUser.name);
    setSelectedUser(selectedUser);
    
    // reflect in URL so back swipe stays within /chat
    setSearchParams({ uid: String(selectedUser.id) }, { replace: false });
    
    if (isMobile) {
      setView("chat");
    }
    
    // Mark messages as read when user is selected
    if (socket && user?.id && selectedUser?.id) {
      console.log("📖 Marking messages as read from:", selectedUser.name);
      socket.emit("markAsRead", {
        senderId: selectedUser.id,
        receiverId: user.id
      });
      
      // Update local state immediately for better UX
      setUnreadCounts(prev => ({
        ...prev,
        [selectedUser.id]: 0
      }));
    }
  };

  const handleBack = () => {
    setView("sidebar");
    setSelectedUser(null);
    // clear query param to support back within /chat
    setSearchParams({}, { replace: false });
  };

  // Debug: Log unread counts changes
  useEffect(() => {
    console.log("🔔 Unread counts updated:", unreadCounts);
  }, [unreadCounts]);

  // Sync selected user with URL (uid) so back swipe stays within /chat
  useEffect(() => {
    const uid = searchParams.get("uid");
    if (uid && users.length > 0) {
      const u = users.find(x => String(x.id) === String(uid));
      if (u) {
        setSelectedUser(u);
        if (isMobile) setView("chat");
      }
    } else {
      // No uid => show sidebar on mobile
      if (isMobile) setView("sidebar");
    }
  }, [searchParams, users, isMobile]);

  return (
    <Box
      sx={{
        display: "flex",
        position: "absolute",
        top: NAVBAR_HEIGHT,
        left: 0,
        height: `calc(var(--vh, 1vh) * 100 - ${NAVBAR_HEIGHT}px)`,
        width: "100vw",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {/* Always show sidebar on desktop, conditionally on mobile */}
      {(view === "sidebar" || !isMobile) && (
        <ChatSidebar
          users={users}
          onSelect={handleSelectUser}
          selectedUser={selectedUser}
          isMobile={isMobile}
          unreadCounts={unreadCounts}
        />
      )}
      
      {/* Show chat window when user is selected (always on desktop if user selected) */}
      {(view === "chat" || (!isMobile && selectedUser)) && (
        <ChatWindow
          currentUser={user}
          otherUser={selectedUser}
          onBack={handleBack}
          isMobile={isMobile}
          socket={socket}
        />
      )}
      
      {/* Show placeholder when no user selected on desktop */}
      {!isMobile && !selectedUser && (
        <Box 
          className="chat-window-bg"
          sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'transparent'
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Select a user to start chatting
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(Chat);