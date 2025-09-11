import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import NewTask from "./components/Newtask";
import Chat from "./components/Chat";
import { UserProvider } from "./UserProvider"; // Import context

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Assign Task", path: "/newtask" },
  { label: "Chat", path: "/chat" },
  { label: "Home", path: "/" },
];

const App = () => (
  <UserProvider>
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Task Portal</Typography>
          {navItems.map((item) => (
            <Button color="inherit" component={Link} to={item.path} key={item.path}>
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Box mt={3}>
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
  </UserProvider>
);

export default App;
