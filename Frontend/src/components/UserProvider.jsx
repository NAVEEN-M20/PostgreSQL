// src/components/UserProvider.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${API_URL}/api/me`, { 
          withCredentials: true,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (isMounted) {
          setUser(res.data.user || null);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return null; 
  }

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};