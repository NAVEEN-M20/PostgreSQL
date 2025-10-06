// src/components/UserProvider.js
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { UserContext } from "./UserContext"

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${API_URL}/api/me`, { withCredentials: true });
        setUser(res.data.user || null);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};