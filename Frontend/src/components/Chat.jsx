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

let globalSocket = null;

const Chat = ({ setUnreadCounts }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("sidebar");
  const [unreadCountsLocal, setUnreadCountsLocal] = useState({});
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [socket, setSocket] = useState(null);
  const [setSearchParams] = useSearchParams();

  // Sync local unread counts to Navbar
  useEffect(() => {
    if (setUnreadCounts) setUnreadCounts(unreadCountsLocal);
  }, [unreadCountsLocal, setUnreadCounts]);

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(API_URL, {
        path: "/socket.io/",
        withCredentials: true,
        transports: ["polling", "websocket"],
      });

      globalSocket.on("connect", () => {
        if (user?.id) globalSocket.emit("register", user.id);
      });
    }
    setSocket(globalSocket);
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleUnreadCounts = (counts) => setUnreadCountsLocal(counts);

    const handleReceiveMessage = (message) => {
      if (message.sender_id && message.sender_id !== user?.id && message.sender_id !== selectedUser?.id) {
        setUnreadCountsLocal(prev => ({
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

  // Fetch users & unread counts
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!user) return;
      try {
        const [usersRes, unreadRes] = await Promise.all([
          axios.get(`${API_URL}/api/users`, { withCredentials: true }),
          axios.get(`${API_URL}/api/messages/unread-counts`, { withCredentials: true })
        ]);
        if (mounted) {
          setUsers(usersRes.data || []);
          setUnreadCountsLocal(unreadRes.data || {});
        }
      } catch {
        if (mounted) {
          setUsers([]);
          setUnreadCountsLocal({});
        }
      }
    };
    run();
    return () => { mounted = false; };
  }, [user]);

  const handleSelectUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    setSearchParams({ uid: String(selectedUser.id) }, { replace: false });
    if (isMobile) setView("chat");

    if (socket && user?.id && selectedUser?.id) {
      socket.emit("markAsRead", { senderId: selectedUser.id, receiverId: user.id });
      setUnreadCountsLocal(prev => ({ ...prev, [selectedUser.id]: 0 }));
    }
  };

  const handleBack = () => {
    setView("sidebar");
    setSelectedUser(null);
    setSearchParams({}, { replace: false });
  };

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
      {(view === "sidebar" || !isMobile) && (
        <ChatSidebar
          users={users}
          onSelect={handleSelectUser}
          selectedUser={selectedUser}
          isMobile={isMobile}
          unreadCounts={unreadCountsLocal}
        />
      )}
      {(view === "chat" || (!isMobile && selectedUser)) && (
        <ChatWindow
          currentUser={user}
          otherUser={selectedUser}
          onBack={handleBack}
          isMobile={isMobile}
          socket={socket}
        />
      )}
      {!isMobile && !selectedUser && (
        <Box
          className="chat-window-bg"
          sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}
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
