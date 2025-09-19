import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import NewTask from "./components/Newtask";
import Chat from "./components/Chat";
import { UserProvider } from "./components/UserProvider";
import Navbar from "./components/NavBar";
import { CssBaseline, Toolbar, Box, useMediaQuery, useTheme } from "@mui/material";

function App() {
  const theme = useTheme();
  // Detect mobile viewport with MUI breakpoint
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const NAVBAR_HEIGHT = 64; // Adjust if different in Navbar

  return (
    <UserProvider>
      <Router>
        <CssBaseline />

        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/*"
            element={
              <>
                <Navbar position={isMobile ? "fixed" : "static"} />
                {isMobile && <Toolbar />} {/* Reserve space only on mobile */}

                <Box
                  sx={{
                    height: isMobile ? `calc(100vh - ${NAVBAR_HEIGHT}px)` : "auto",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/newtask" element={<NewTask />} />
                    <Route path="/chat" element={<Chat />} />
                  </Routes>
                </Box>
              </>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
