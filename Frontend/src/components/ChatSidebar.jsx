import React, { memo, useState, useCallback, useMemo } from "react";
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
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import NotificationBubble from "./NotificationBubble";

const ChatSidebar = ({
  users,
  onSelect,
  selectedUser,
  isMobile,
  unreadCounts,
  lastMessageTimestamps,
  lastMessages,
  currentUserId,
}) => {
  const theme = useTheme();
  const handleSelect = useCallback((user) => onSelect(user), [onSelect]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Optimized sorting
  const sortedUsers = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const timestampA = lastMessageTimestamps?.[a.id] || 0;
      const timestampB = lastMessageTimestamps?.[b.id] || 0;
      return timestampB - timestampA;
    });

    return sorted;
  }, [users, lastMessageTimestamps, searchQuery]);

  // Optimized last message formatting
  const formatLastMessage = useCallback((user) => {
    const lastMessage = lastMessages[user.id];
    if (!lastMessage) return "No messages yet";

    const isCurrentUser = lastMessage.sender_id === currentUserId;
    const messageText = lastMessage.message;
    
    const truncatedMessage = messageText.length > 30 
      ? messageText.substring(0, 30) + "..." 
      : messageText;

    return isCurrentUser ? `You: ${truncatedMessage}` : truncatedMessage;
  }, [lastMessages, currentUserId]);

  // Read receipt rendering
  const renderLastMessageReadReceipt = useCallback((user) => {
    const lastMessage = lastMessages[user.id];
    
    // Only show read receipt for messages sent by current user
    if (!lastMessage || lastMessage.sender_id !== currentUserId) {
      return null;
    }

    if (lastMessage.is_read) {
      return (
        <DoneAllIcon 
          sx={{ 
            fontSize: 14, 
            color: theme.palette.mode === "dark" ? "#6a11cb" : "#2575fc",
            ml: 0.5 
          }} 
        />
      );
    } else {
      return (
        <DoneIcon 
          sx={{ 
            fontSize: 14, 
            color: theme.palette.mode === "dark" ? "#666" : "#999",
            ml: 0.5 
          }} 
        />
      );
    }
  }, [lastMessages, currentUserId, theme.palette.mode]);

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

      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search users..."
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
                  sx={{ color: "grey" }}
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
          {sortedUsers.length === 0 ? (
            <Typography sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
              {searchQuery ? "No users found" : "No users available"}
            </Typography>
          ) : (
            sortedUsers.map((user) => {
              const unreadCount = unreadCounts[user.id] || 0;

              return (
                <ListItemButton
                  key={user.id}
                  selected={selectedUser?.id === user.id}
                  onClick={() => handleSelect(user)}
                  sx={{
                    borderRadius: 0,
                    borderColor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                    position: "relative",
                    "&.Mui-selected": {
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#1e1e1e" : "#e3f2fd",
                    },
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
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: theme.palette.mode === "dark" ? "#fff" : "#000",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.name || user.email}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                        >
                          {formatLastMessage(user)}
                        </Typography>
                        {renderLastMessageReadReceipt(user)}
                      </Box>
                    </Box>
                    {unreadCount > 0 && <NotificationBubble count={unreadCount} size={20} />}
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