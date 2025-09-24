import React, { memo, useCallback } from "react";
import { Box, Typography, List, ListItemButton } from "@mui/material";

const ChatSidebar = ({ users, onSelect, selectedUser, isMobile, unreadCounts }) => {
  const handleSelect = useCallback(
    (user) => onSelect(user),
    [onSelect]
  );

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
      <Typography
        variant="h6"
        sx={{
          p: 2,
          fontWeight: "bolder",
          borderBottom: "1px solid",
          borderColor: 'divider',
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
          pb: 3,
        }}
      >
        <List sx={{ p: 0 }}>
          {users.length === 0 && (
            <Typography sx={{ p: 2, color: "text.secondary" }}>
              No users available
            </Typography>
          )}
          {users.map((user) => {
            const unreadCount = unreadCounts[user.id] || 0;
            
            return (
              <ListItemButton
                key={user.id}
                selected={selectedUser?.id === user.id}
                onClick={() => handleSelect(user)}
                sx={{ 
                  borderRadius: 0, 
                  borderBottom: "1px solid #f0f0f0",
                  position: 'relative',
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                  
                  {/* Unread message bubble */}
                  {unreadCount > 0 && (
                    <Box
                      sx={{
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        marginLeft: 'auto',
                      }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Box>
                  )}
                </Box>
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

export default memo(ChatSidebar);
