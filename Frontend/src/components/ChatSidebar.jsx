import React, { memo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ChatSidebar = ({ users, onSelect, selectedUser, isMobile, unreadCounts }) => {
  const theme = useTheme();
  const handleSelect = useCallback(
    (user) => onSelect(user),
    [onSelect]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Filter users by search
  const filteredUsers = users.filter((user) =>
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Cancel search
  const handleCancelSearch = () => {
    setSearchQuery("");
    setSearchFocused(false);
  };

  return (
    <Box
      className="chat-sidebar-bg"
      sx={{
        width: isMobile ? "100%" : "30%",
        minWidth: isMobile ? "100%" : 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: isMobile ? "none" : "1.5px solid #dadada",
        background: "transparent",
        minHeight: 0,
      }}
    >
      {/* Header */}
      <Typography
        variant="h6"
        sx={{
          p: 2,
          fontWeight: "bolder",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        Chats
      </Typography>

      {/* Search Bar */}
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #eee" }}>
        <TextField
          fullWidth
          placeholder="Select users..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            if (!searchQuery) setSearchFocused(false);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  size="small"
                  onClick={searchFocused ? handleCancelSearch : undefined}
                  sx={{ color: "grey"}}
                >
                  {searchFocused ? <ArrowBackIcon /> : <SearchIcon />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              py: 1.2, 
              borderRadius: "24px", 
              backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
              "& .MuiInputBase-input": {
                color: theme.palette.mode === "dark" ? "#fff" : "#000",
              },
            },
          }}
        />
      </Box>

      {/* Scrollable user list */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          minHeight: 0,
          pb: 3,
        }}
      >
        <List sx={{ p: 0 }}>
          {filteredUsers.length === 0 ? (
            <Typography sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
              No user found
            </Typography>
          ) : (
            filteredUsers.map((user) => {
              const unreadCount = unreadCounts[user.id] || 0;

              return (
                <ListItemButton
                  key={user.id}
                  selected={selectedUser?.id === user.id}
                  onClick={() => handleSelect(user)}
                  sx={{
                    borderRadius: 0,
                    borderBottom: "1px solid #f0f0f0",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      py: 1,
                    }}
                  >
                    {/* User Avatar */}
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                        mr: 2,
                      }}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </Box>

                    {/* User Info */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        className="gradient-text"
                        sx={{
                          fontWeight: "bold",
                          background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          display: "inline-block",
                        }}
                      >
                        {user.name || user.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {user.email}
                      </Typography>
                    </Box>

                    {/* Unread Bubble */}
                    {unreadCount > 0 && (
                      <Box
                        sx={{
                          minWidth: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#1d4ed8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          marginLeft: "auto",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Box>
                    )}
                  </Box>
                </ListItemButton>
              );
            })
          )}
        </List>
      </Box>
    </Box>
  );
};

export default memo(ChatSidebar);
