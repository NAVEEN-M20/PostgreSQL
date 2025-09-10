import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard`, {
          withCredentials: true,
        });
        setUser(res.data.user);
        setTasks(res.data.tasks);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    fetchDashboard();
  }, []);

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/task/${taskId}`, {
        withCredentials: true,
      });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || "User"} 👋
      </Typography>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Your Tasks
      </Typography>

      {tasks.length === 0 ? (
        <Typography color="textSecondary">No tasks assigned yet.</Typography>
      ) : (
        <List sx={{ width: "100%", maxWidth: 600, bgcolor: "background.paper" }}>
          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDelete(task.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div">
                      {task.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2">{task.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assigned by: <b>{task.assigned_by_name}</b>
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < tasks.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default Dashboard;
