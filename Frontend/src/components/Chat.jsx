import React, { useEffect, useState, useContext } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import { UserContext } from "./UserContext";
import { io } from "socket.io-client"; // ✅ proper import

const API_URL = import.meta.env.VITE_API_URL;
const NAVBAR_HEIGHT = 64;

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("sidebar");
  const [unreadCounts, setUnreadCounts] = useState({});
  const { user, setUser } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const socketRef = React.useRef(null);

  // Viewport height handling
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(API_URL, {
        path: "/socket.io/",
        withCredentials: true,
        transports: ["polling", "websocket"],
      });

      socketRef.current.on("unreadCounts", (counts) => {
        setUnreadCounts(counts);
      });

      socketRef.current.on("receiveMessage", (message) => {
        if (message.sender_id && message.sender_id !== user?.id) {
          setUnreadCounts((prev) => ({
            ...prev,
            [message.sender_id]: (prev[message.sender_id] || 0) + 1,
          }));
        }
      });

      socketRef.current.on("connect", () => {
        if (user?.id) {
          socketRef.current.emit("register", user.id);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // Fetch session, users, and initial unread counts
  useEffect(() => {
    let mounted = true;
    const fetchSessionAndUsers = async () => {
      try {
        if (!user) {
          const me = await axios.get(`${API_URL}/api/me`, { withCredentials: true });
          if (mounted && me?.data?.user && setUser) {
            setUser(me.data.user);
          }
        }

        const activeUser =
          user ||
          (await axios.get(`${API_URL}/api/me`, { withCredentials: true })).data.user;
        if (!activeUser) {
          setUsers([]);
          return;
        }

        const [usersRes, unreadRes] = await Promise.all([
          axios.get(`${API_URL}/api/users`, { withCredentials: true }),
          axios.get(`${API_URL}/api/messages/unread-counts`, { withCredentials: true }),
        ]);

        if (mounted) {
          setUsers(usersRes.data || []);
          setUnreadCounts(unreadRes.data || {});
        }

        if (socketRef.current && activeUser.id) {
          socketRef.current.emit("register", activeUser.id);
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
  }, [user, setUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) {
      setView("chat");
    }

    if (socketRef.current && user?.id) {
      socketRef.current.emit("markAsRead", {
        senderId: user.id,
        receiverId: user.id,
      });

      setUnreadCounts((prev) => ({
        ...prev,
        [user.id]: 0,
      }));
    }
  };

  const handleBack = () => {
    setView("sidebar");
    setSelectedUser(null);
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
          socketRef={socketRef}
        />
      )}
    </Box>
  );
};

export default React.memo(Chat);
