import React, { useEffect, useState, useContext, useCallback } from "react";
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
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const { user, socket, loading } = useContext(UserContext);
  const navigate = useNavigate();

  // Simplified redirect logic
  useEffect(() => {
    if (!loading && user === null) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch tasks only - user is already available from UserProvider
  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/dashboard/tasks`, {
        // Create dedicated endpoint
        withCredentials: true,
        headers: { "Cache-Control": "no-cache" },
      });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Tasks fetch error:", err);
      setTasks([]);
    }
  }, []);

  // Initialize tasks only
  useEffect(() => {
    if (user && !loading) {
      fetchTasks();
    }
  }, [user, loading, fetchTasks]);

  // Optimized delete handler
  const handleDelete = useCallback(
    async (taskId, taskTitle, assignedById) => {
      const originalTasks = [...tasks];
      try {
        // Optimistic update
        setTasks((prev) => prev.filter((task) => task.id !== taskId));

        await axios.delete(`${API_URL}/api/task/${taskId}`, {
          withCredentials: true,
        });

        if (socket && assignedById && user) {
          socket.emit("sendMessage", {
            senderId: user.id,
            receiverId: assignedById,
            message: `${taskTitle} completed!!`,
          });
        }
      } catch (err) {
        console.error("Error deleting task:", err);
        setTasks(originalTasks);
      }
    },
    [user, tasks, socket]
  );

  // Memoized task list item to prevent unnecessary re-renders
  const TaskListItem = useCallback(
    ({ task, index }) => (
      <React.Fragment key={task.id}>
        <ListItem
          secondaryAction={
            <IconButton
              edge="end"
              onClick={() =>
                handleDelete(task.id, task.title, task.assigned_by)
              }
              sx={{ ml: 3 }}
            >
              <DeleteIcon sx={{ color: "#ef4444" }} />
            </IconButton>
          }
          sx={{
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
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
              color: "text.secondary",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              marginLeft: 2,
              color: "text.secondary",
              fontStyle: "italic",
              minWidth: "120px",
              textAlign: "right",
            }}
          >
            Assigned by:{" "}
            <span
              style={{
                fontWeight: "bold",
                background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              {task.assigned_by_name}
            </span>
          </Typography>
        </ListItem>
        {index < tasks.length - 1 && <Divider />}
      </React.Fragment>
    ),
    [handleDelete, tasks.length]
  );

  return (
    <Box
      className="dashboard-container"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: `calc(var(--vh, 1vh) * 100 - 64px)`,
        overflow: "hidden",
        p: 2,
        background: "transparent",
        minHeight: 0,
      }}
    >
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
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
          background: "transparent",
          minHeight: 0,
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
            borderBottom: "1px solid",
            borderColor: "divider",
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
            minHeight: 0,
            pb: 3,
            "&::-webkit-scrollbar": {
              display: "none",
            },
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
          }}
        >
          {tasks.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 8 }}>
              No tasks assigned yet.
            </Typography>
          ) : (
            <List sx={{ p: 2, pt: 0 }}>
              {tasks.map((task, index) => (
                <TaskListItem key={task.id} task={task} index={index} />
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default React.memo(Dashboard);
