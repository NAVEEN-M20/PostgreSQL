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
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (!user) {
      setUsers([]);
      return;
    }
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
  }, [user]);

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