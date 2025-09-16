import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import NewTask from "./components/Newtask";
import Chat from "./components/Chat";
import { UserProvider } from "./components/UserProvider"; // Import context


const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Assign Task", path: "/newtask" },
  { label: "Chat", path: "/chat" },
  { label: "Home", path: "/" },
];

// Separate component to manage layout and navbar visibility
const Layout = ({ children }) => {
  const location = useLocation();

  const hideNavbarPaths = ["/", "/login", "/register"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && (
        <>
          <AppBar position="fixed" sx={{ backgroundColor: "grey", boxShadow: "none" }}>
            <Toolbar>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  flexGrow: 1,
                  letterSpacing: 2,
                  color: "white",
                }}
              >
                Task Portal
              </Typography>

              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: "white",
                    mx: 1.5,
                    "&:hover": {
                      backgroundColor: "#64b5f6",
                      color: "black",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Toolbar>
          </AppBar>

          {/* Spacer so content is not hidden behind fixed navbar */}
          <Toolbar />
        </>
      )}

      <Box>{children}</Box>
    </>
  );
};

const App = () => (
  <UserProvider>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/newtask" element={<NewTask />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </UserProvider>
);

export default App;
