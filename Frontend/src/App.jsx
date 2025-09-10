import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import NewTask from "./components/Newtask";
import Chat from "./components/Chat";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Assign Task", path: "/newtask" },
  { label: "Chat", path: "/chat" },
  { label: "Home", path: "/" },
];

const App = () => (
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
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/newtask" element={<NewTask />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Box>
  </BrowserRouter>
);

export default App;
