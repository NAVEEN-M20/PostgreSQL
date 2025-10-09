import React, { useEffect, useState, useContext, useCallback } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import { UserContext } from "./UserContext";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const NAVBAR_HEIGHT = 64;

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("sidebar");
  const { user, socket, unreadCounts, fetchUnreadCounts } = useContext(UserContext);
  const [lastMessageTimestamps, setLastMessageTimestamps] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  // Optimized function to update last message
  const updateLastMessage = useCallback((message, otherUserId) => {
    setLastMessages(prev => ({
      ...prev,
      [otherUserId]: message
    }));
    setLastMessageTimestamps(prev => ({
      ...prev,
      [otherUserId]: new Date(message.created_at).getTime()
    }));
  }, []);

  // PARALLEL DATA LOADING - Load users and last messages simultaneously
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const initializeChat = async () => {
      try {
        console.log("🚀 Initializing chat data in parallel...");
        
        // Load users and last messages in parallel
        const [usersRes, lastMessagesRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/users`, { withCredentials: true }),
          axios.get(`${API_URL}/api/messages/last-messages`, { 
            withCredentials: true,
            timeout: 5000
          })
        ]);

        if (!mounted) return;

        // Process users
        if (usersRes.status === 'fulfilled') {
          const usersData = usersRes.value.data || [];
          setUsers(usersData);
          console.log("✅ Users loaded:", usersData.length);
        }

        // Process last messages
        if (lastMessagesRes.status === 'fulfilled') {
          const lastMessagesData = lastMessagesRes.value.data || {};
          const timestampsData = {};
          
          Object.keys(lastMessagesData).forEach(userId => {
            const message = lastMessagesData[userId];
            if (message) {
              timestampsData[userId] = new Date(message.created_at).getTime();
            }
          });
          
          setLastMessages(lastMessagesData);
          setLastMessageTimestamps(timestampsData);
          console.log("✅ Last messages loaded for", Object.keys(lastMessagesData).length, "users");
        }

        setIsInitialized(true);
        
      } catch (error) {
        console.error("Error initializing chat:", error);
        if (mounted) {
          setUsers([]);
          setIsInitialized(true);
        }
      }
    };

    initializeChat();
    return () => { mounted = false; };
  }, [user]);

  // CRITICAL FIX: Centralized socket listener for read receipts in parent component
  useEffect(() => {
    if (!socket || !isInitialized || !user) return;

    const handleMessagesReadByReceiver = (data) => {
      console.log("✅ Chat (Parent): Our messages read by receiver", data);
      
      // Update lastMessages for ALL affected conversations
      setLastMessages(prev => {
        const updated = { ...prev };
        
        // Find which conversation partner corresponds to these message IDs
        Object.keys(updated).forEach(userId => {
          const lastMsg = updated[userId];
          if (lastMsg && 
              lastMsg.sender_id === user.id && 
              data.messageIds && 
              data.messageIds.includes(lastMsg.id)) {
            updated[userId] = { ...lastMsg, is_read: true };
            console.log(`✅ Updated read receipt for user ${userId}`);
          }
        });
        
        return updated;
      });
    };

    // Real-time socket updates for new messages
    const handleReceiveMessage = (message) => {
      if (message.sender_id !== user.id) {
        updateLastMessage(message, message.sender_id);
      } else {
        updateLastMessage(message, message.receiver_id);
      }
    };

    const handleMessageSent = (message) => {
      updateLastMessage(message, message.receiver_id);
    };

    // Set up all event listeners
    socket.on("messagesReadByReceiver", handleMessagesReadByReceiver);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSent", handleMessageSent);

    return () => {
      socket.off("messagesReadByReceiver", handleMessagesReadByReceiver);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSent", handleMessageSent);
    };
  }, [socket, user, isInitialized, updateLastMessage]);

  // FAST URL parameter handling
  useEffect(() => {
    const uid = searchParams.get("uid");
    
    if (uid && users.length > 0 && isInitialized) {
      const userToSelect = users.find((u) => u.id === parseInt(uid, 10));
      
      if (userToSelect && userToSelect.id !== selectedUser?.id) {
        setSelectedUser(userToSelect);
        if (isMobile) setView("chat");

        // Mark as read immediately
        if (socket && user?.id && userToSelect?.id) {
          socket.emit("markAsRead", {
            senderId: userToSelect.id,
            receiverId: user.id,
          });
        }
      }
    } else if (!uid && selectedUser !== null) {
      setSelectedUser(null);
      if (isMobile) setView("sidebar");
    }
  }, [searchParams, users, isMobile, selectedUser, isInitialized, socket, user]);

  // Optimized user selection
  const handleSelectUser = useCallback((selectedUser) => {
    // Immediate state update for instant feedback
    setSelectedUser(selectedUser);
    if (isMobile) setView("chat");
    
    // Update URL
    setSearchParams({ uid: String(selectedUser.id) }, { replace: false });

    // Mark as read
    if (socket && user?.id && selectedUser?.id) {
      socket.emit("markAsRead", {
        senderId: selectedUser.id,
        receiverId: user.id,
      });
      setTimeout(fetchUnreadCounts, 100);
    }
  }, [isMobile, socket, user, setSearchParams, fetchUnreadCounts]);

  const handleBack = useCallback(() => {
    setView("sidebar");
    setSelectedUser(null);
    setSearchParams({}, { replace: false });
  }, [setSearchParams]);

  // Show loading only during initial load
  if (!isInitialized) {
    return (
      <Box sx={{ 
        position: "absolute", 
        top: NAVBAR_HEIGHT, 
        left: 0, 
        height: `calc(var(--vh, 1vh) * 100 - ${NAVBAR_HEIGHT}px)`,
        width: "100vw",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "transparent",
      }}>
        <Typography>Loading chats...</Typography>
      </Box>
    );
  }

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
          unreadCounts={unreadCounts}
          lastMessageTimestamps={lastMessageTimestamps}
          lastMessages={lastMessages}
          currentUserId={user?.id}
        />
      )}
      {(view === "chat" || (!isMobile && selectedUser)) && (
        <ChatWindow
          currentUser={user}
          otherUser={selectedUser}
          onBack={handleBack}
          isMobile={isMobile}
          socket={socket}
          setLastMessageTimestamps={setLastMessageTimestamps}
          updateLastMessage={updateLastMessage}
          lastMessages={lastMessages}
        />
      )}
      {!isMobile && !selectedUser && (
        <Box
          className="chat-window-bg"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ fontStyle: "italic" }}>
            Select a user to start chatting
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(Chat);