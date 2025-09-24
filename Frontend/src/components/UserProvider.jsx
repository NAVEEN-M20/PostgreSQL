// src/components/UserProvider.js
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { UserContext } from "./UserContext"

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${API_URL}/api/me`, { withCredentials: true });
        if (mounted) setUser(res.data.user || null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!loaded) return null;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};