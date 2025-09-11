import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link} from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Newtask from "./Newtask";
import Chat from "./Chat"
const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const [user, setUser] = useState(null);

  // On mount, check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`, { credentials: "include" });
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err){
        console.log("error fetching user:", err.message);
      }
    };
    checkUser();
  }, []);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Assign Task", path: "/newtask" },
    { label: "Chat", path: "/chat" },
    { label: "Login", path: "/login" },
    { label: "Register", path: "/register" },
  ];

  return (
    <BrowserRouter>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Task Portal</Typography>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              sx={{ ml: 1 }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: "64px" }} /> {/* Spacer for fixed navbar */}
      <Box>
        <Routes>
          <Route path="/" element={<Dashboard user={user} setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/newtask" element={<Newtask user={user} />} />
          <Route path="/chat" element={<Chat user={user} />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};

export default App;
