import React, { useEffect, useState, useContext } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import { UserContext } from "./UserContext";

const API_URL = import.meta.env.VITE_API_URL;
const NAVBAR_HEIGHT = 64; 

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("sidebar"); // "sidebar" or "chat"
  // NOTE: we now destructure setUser as well (your UserProvider already exposes it in other files)
  const { user, setUser } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    // Ensure the session is hydrated — if user missing, ask /api/me
    // This is the minimal, non-invasive change: it does not touch styling/layout.
    let mounted = true;
    const fetchSessionAndUsers = async () => {
      try {
        if (!user) {
          // call /api/me to restore session from cookie on direct reload
          const me = await axios.get(`${API_URL || ""}/api/me`, { withCredentials: true });
          if (mounted && me?.data?.user && setUser) {
            setUser(me.data.user);
          }
        }

        // After attempting session restore, fetch users if authenticated
        // We attempt to use current user from context, but also try /api/me again to be safe
        const activeUser = user || (await axios.get(`${API_URL || ""}/api/me`, { withCredentials: true })).data.user;
        if (!activeUser) {
          setUsers([]);
          return;
        }

        const res = await axios.get(`${API_URL || ""}/api/users`, {
          withCredentials: true,
        });
        if (mounted) setUsers(res.data || []);
      } catch (err) {
        console.error("Error initializing chat:", err);
        if (mounted) setUsers([]);
      }
    };

    fetchSessionAndUsers();

    return () => {
      mounted = false;
    };
    // Intentional empty deps: run once on mount and hydrate.
  }, []); // keep original behaviour & styling

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) setView("chat");
  };

  const handleBack = () => {
    setView("sidebar");
  };

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
        />
      )}
      {(view === "chat" || !isMobile) && (
        <ChatWindow
          currentUser={user}
          otherUser={selectedUser}
          onBack={handleBack}
          isMobile={isMobile}
        />
      )}
    </Box>
  );
};

export default React.memo(Chat);
