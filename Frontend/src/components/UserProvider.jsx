import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
import { io } from "socket.io-client";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [socket, setSocket] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch unread counts
  const fetchUnreadCounts = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/api/messages/unread-counts`, {
        withCredentials: true,
      });
      setUnreadCounts(response.data || {});
    } catch (error) {
      console.error("Failed to fetch unread counts:", error);
    }
  };

  // Initialize user and socket
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/me`, {
          withCredentials: true,
        });
        setUser(res.data.user);
        if (res.data.user) {
          setUnreadCounts(res.data.unreadCounts || {});
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [API_URL]);

  // Fetch unread counts after setting user
  useEffect(() => {
    if (user) {
      fetchUnreadCounts();
    }
  }, [user]);

  // Initialize socket when user is available
  useEffect(() => {
    if (!user) return;

    const newSocket = io(API_URL, {
      withCredentials: true,
      reconnection: true,
      transports: ["websocket", "polling"]
    });

    newSocket.on("connect", () => {
      console.log("✅ UserProvider Socket connected:", newSocket.id);
      newSocket.emit("register", user.id);
    });

    newSocket.on("unreadCounts", (counts) => {
      console.log("📊 UserProvider received unread counts:", counts);
      setUnreadCounts(counts);
    });

    newSocket.on("receiveMessage", (message) => {
      console.log("📨 UserProvider received message:", message);
      // Update unread counts when receiving new messages
      if (message.sender_id && message.sender_id !== user.id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender_id]: (prev[message.sender_id] || 0) + 1,
        }));
      }
    });

    // Handle when messages are read by receiver
    newSocket.on("messagesReadByReceiver", (data) => {
      console.log("✅ Messages read by receiver:", data);
      // No need to update unread counts here as they're handled by markAsRead
    });

    newSocket.on("disconnect", () => {
      console.log("❌ UserProvider Socket disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, API_URL]);

  // Calculate total unread count
  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, count) => sum + (count || 0),
    0
  );

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        unreadCounts,
        totalUnread,
        fetchUnreadCounts,
        socket,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};