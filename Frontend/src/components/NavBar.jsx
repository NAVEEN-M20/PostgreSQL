import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "./UseThemeMode";
import NotificationBubble from "./NotificationBubble";

export default function Navbar({ unreadCounts }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const { mode, toggle } = useThemeMode();

  // Total unread count
  const totalUnread = Object.values(unreadCounts || {}).reduce(
    (a, b) => a + b,
    0
  );

  // Hide Navbar on Welcome/Login/Register
  const hideOn = ["/", "/login", "/register"];
  if (hideOn.includes(location.pathname)) return null;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #2575fc, #6a11cb)",
        boxShadow: 3,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          TaskPortal
        </Typography>

        <IconButton
          color="inherit"
          onClick={toggle}
          sx={{ ml: 1, mr: "auto" }}
          aria-label="toggle theme"
        >
          {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        {isMobile ? (
          <>
            <Box sx={{ position: "relative" }}>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                aria-label="menu"
                aria-controls="navbar-menu"
                aria-haspopup="true"
              >
                <MenuIcon />
              </IconButton>
              <NotificationBubble
                count={totalUnread}
                size={18}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                }}
              />
            </Box>

            <Menu
              id="navbar-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleMenuNavigation("/dashboard")}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => handleMenuNavigation("/newtask")}>
                New Task
              </MenuItem>
              <MenuItem onClick={() => handleMenuNavigation("/chat")}>
                Chat {totalUnread > 0 && `(${totalUnread})`}
              </MenuItem>

              <MenuItem
                onClick={() => handleMenuNavigation("/logout")}
                sx={{
                  color: "red",
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "red",
                    color: "white",
                  },
                }}
              >
                Logout <LogoutIcon sx={{ ml: 1, fontSize: 15 }} />
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button color="inherit" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button color="inherit" onClick={() => navigate("/newtask")}>
              New Task
            </Button>
            <Box sx={{ position: "relative" }}>
              <Button color="inherit" onClick={() => navigate("/chat")}>
                Chat
              </Button>
              <NotificationBubble
                count={totalUnread}
                size={16}
                sx={{ position: "absolute", bottom: 0, right: 0 }}
              />
            </Box>
            <Button
              color="inherit"
              onClick={() => navigate("/logout")}
              sx={{
                color: "red",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "red",
                  color: "white",
                },
              }}
            >
              Logout <LogoutIcon sx={{ ml: 1, fontSize: 15 }} />
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
