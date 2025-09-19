// ChatSidebar.jsx
import React, { memo, useCallback } from "react";
import { Box, Typography, List, ListItemButton, Badge } from "@mui/material";

const ChatSidebar = ({ users, onSelect, selectedUser, isMobile, unreadCounts }) => {
  const handleSelect = useCallback((user) => onSelect(user), [onSelect]);

  return (
    <Box
      sx={{
        width: isMobile ? "100%" : "30%",
        minWidth: isMobile ? "100%" : 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: isMobile ? "none" : "1.5px solid #dadada",
        background: "#fff",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          p: 2,
          fontWeight: "bolder",
          borderBottom: "1.5px solid #dadada",
        }}
      >
        Chats
      </Typography>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          minHeight: 0,
        }}
      >
        <List sx={{ p: 0 }}>
          {users.length === 0 && (
            <Typography sx={{ p: 2, color: "text.secondary" }}>No users available</Typography>
          )}
          {users.map((user) => (
            <ListItemButton
              key={user.id}
              selected={selectedUser?.id === user.id}
              onClick={() => handleSelect(user)}
              sx={{ borderRadius: 0, borderBottom: "1px solid #f0f0f0" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  py: 1,
                }}
              >
                <Badge
                  color="error"
                  badgeContent={unreadCounts[user.id] || 0}
                  invisible={!unreadCounts[user.id] || unreadCounts[user.id] === 0}
                  sx={{ mr: 2 }}
                >
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
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Box>
                </Badge>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      display: "inline-block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name || user.email}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default memo(ChatSidebar);
