import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { UserContext } from "./UserContext";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
let socket;

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      socket = io(API_URL, { 
        withCredentials: true,
        path: "/socket.io/",
      });
    }

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard`, {
          withCredentials: true,
          headers: { "Cache-Control": "no-cache" },
        });
        setUser(res.data.user);
        setTasks(res.data.tasks);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };
    fetchDashboard();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [setUser]);

  const handleDelete = async (taskId, taskTitle, assignedById) => {
    try {
      await axios.delete(`${API_URL}/api/task/${taskId}`, {
        withCredentials: true,
      });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      
      // Send completion message to the assigner
      if (socket && assignedById && user) {
        socket.emit("sendMessage", {
          senderId: user.id,
          receiverId: assignedById,
          message: `${taskTitle} completed!!`,
          type: "task_completed"
        });
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <Box
      className="dashboard-container"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        p: 2,
        background: "transparent",
      }}
    >
      {/* Header Section - Fixed */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          Welcome,{" "}
          <Box
            component="span"
            sx={{
              background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
              fontSize: "30px",
            }}
          >
            {user?.name || "User"}
          </Box>{" "}
          👋
        </Typography>

        <Typography
          variant="h4"
          gutterBottom
          sx={{ 
            fontWeight: 600,
            background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Dashboard
        </Typography>
      </Box>

      {/* Tasks Container - Scrollable with hidden scrollbar */}
      <Paper
        elevation={4}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          boxShadow: "none",
          overflow: "hidden",
          background: "transparent"
        }}
      >
        {/* Tasks Header with gradient and margin bottom */}
        <Box 
          sx={{ 
            p: 2, 
            background: "transparent",
            color: "inherit",
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            mb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" align="center">
            Your Tasks ({tasks.length})
          </Typography>
        </Box>

        {/* Scrollable Tasks List with hidden scrollbar */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
          }}
        >
          {tasks.length === 0 ? (
            <Typography 
              align="center" 
              color="text.secondary" 
              sx={{ py: 8 }}
            >
              No tasks assigned yet.
            </Typography>
          ) : (
            <List sx={{ p: 2, pt: 0 }}>
              {tasks.map((task, idx) => (
                <React.Fragment key={task.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(task.id, task.title, task.assigned_by)}
                        sx={{ ml: 3 }}
                      >
                        <DeleteIcon sx={{ color: "#ef4444" }} />
                      </IconButton>
                    }
                    sx={{
                      mb: 2,
                      border: "1px solid",
                      borderColor: 'divider',
                      borderRadius: 2,
                      boxShadow: "none",
                      backgroundColor: "transparent",
                      "&:hover": {
                        backgroundColor: "transparent",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <ListItemText
                      primary={task.title}
                      secondary={task.description}
                      primaryTypographyProps={{
                        fontWeight: "bold",
                        fontSize: "20px",
                        margin: "10px 0",
                      }}
                      secondaryTypographyProps={{ 
                        margin: "10px 0",
                        color: "text.secondary"
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        marginLeft: 2,
                        color: "text.secondary",
                        fontStyle: "italic",
                        minWidth: "120px",
                        textAlign: "right"
                      }}
                    >
                      Assigned by:{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                          background:
                            "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          display: "inline-block",
                        }}
                      >
                        {task.assigned_by_name}
                      </span>
                    </Typography>
                  </ListItem>
                  {idx < tasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default Dashboard;