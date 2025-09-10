import React from "react";
import { List, ListItemButton, ListItemText, Typography, Divider, ListItemIcon } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const ChatSidebar = ({ users, onSelect, selectedUser }) => {
  return (
    <>
      <Typography variant="h6" sx={{ p: 2 }}>
        Chats
      </Typography>
      <Divider />
      <List sx={{ flex: 1, overflowY: "auto" }}>
        {users.length === 0 && (
          <Typography sx={{ p: 2, color: "text.secondary" }}>No users available</Typography>
        )}
        {users.map((user) => (
          <ListItemButton
            key={user.id}
            selected={selectedUser?.id === user.id}
            onClick={() => onSelect(user)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AccountCircleIcon fontSize="medium" />
            </ListItemIcon>
            <ListItemText primary={user.name || user.email} secondary={user.email} />
          </ListItemButton>
        ))}
      </List>
    </>
  );
};

export default ChatSidebar;
