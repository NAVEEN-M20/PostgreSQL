import React from "react";
import { Box, useTheme } from "@mui/material";

const NotificationBubble = ({ count = 0, size = 20, color, sx }) => {
  const theme = useTheme();
  const bubbleColor = color || (theme.palette.mode === "dark" ? "#3b82f6" : "#1d4ed8");

  if (!count || count <= 0) return null;

  return (
    <Box
      sx={{
        minWidth: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: bubbleColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: `${size * 0.65}px`,
        fontWeight: "bold",
        ...sx,
      }}
    >
      {count > 99 ? "99+" : count}
    </Box>
  );
};

export default NotificationBubble;
