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
  const { user, setUser } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // --- NEW: set CSS var --vh to handle mobile viewport/keyboard resizing ---
  useEffect(() => {
    const setVh = () => {
      // window.innerHeight changes when mobile keyboard opens; we store 1vh in px
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);

    // Also update on focusin/focusout — many mobile browsers change innerHeight only after focus
    const onFocusIn = () => setTimeout(setVh, 250);
    const onFocusOut = () => setTimeout(setVh, 250);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
    };
  }, []);
  // --- end new ---

  useEffect(() => {
    // Ensure the session is hydrated — if user missing, ask /api/me
    let mounted = true;
    const fetchSessionAndUsers = async () => {
      try {
        if (!user) {
          const me = await axios.get(`${API_URL || ""}/api/me`, { withCredentials: true });
          if (mounted && me?.data?.user && setUser) {
            setUser(me.data.user);
          }
        }

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
  }, []); // run once on mount to hydrate session

  const handleSelectUser = (u) => {
    setSelectedUser(u);
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
        // use JS-driven --vh so mobile keyboard resizing behaves correctly
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
