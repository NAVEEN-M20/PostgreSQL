import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from './ThemeContext';


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const { mode, toggle } = useThemeMode();

  // Hide Navbar on Welcome/Login/Register
  const hideOn = ["/", "/login", "/register"];
  if (hideOn.includes(location.pathname)) {
    return null;
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
        <IconButton color="inherit" onClick={toggle} sx={{ ml: 1, mr: 'auto' }} aria-label="toggle theme">
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              aria-label="menu"
              aria-controls="navbar-menu"
              aria-haspopup="true"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="navbar-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'menu-button',
              }}
            >
              <MenuItem onClick={() => handleMenuNavigation("/dashboard")}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => handleMenuNavigation("/newtask")}>
                New Task
              </MenuItem>
              <MenuItem onClick={() => handleMenuNavigation("/chat")}>
                Chat
              </MenuItem>
                <MenuItem onClick={() => handleMenuNavigation("/logout")}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "red",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}
                >
                  Logout <LogoutIcon sx={{ ml: 1, fontSize: 15 }} />
                </Box>
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
            <Button color="inherit" onClick={() => navigate("/chat")}>
              Chat
            </Button>
            <Button
              className="btn-logout"
              variant="outlined"
              sx={{
                color: "white",
                background: "red",
                "&:hover": {
                  borderColor: "#ddd",
                  background: "rgba(255,255,255,0.1)",
                },
              }}
              onClick={() => navigate("/logout")}
            >
              Logout <LogoutIcon sx={{ ml: 1, fontSize: 15 }} />
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}