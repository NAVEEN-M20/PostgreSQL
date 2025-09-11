import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Paper,
  Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { UserContext } from "./UserContext";
const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard`, {
          withCredentials: true,
          headers: { "Cache-Control": "no-cache" }
        });
        setUser(res.data.user);
        setTasks(res.data.tasks);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };
    fetchDashboard();
  }, [setUser]);

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/task/${taskId}`, {
        withCredentials: true
      });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <Box display="flex" justifyContent="center">
      <Paper sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome, {user?.name || "User"} <span role="img" aria-label="wave">👋</span>
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 1 }}>Your Tasks</Typography>
        {tasks.length === 0 ? (
          <Typography align="center">No tasks assigned yet.</Typography>
        ) : (
          <List>
            {tasks.map((task, idx) => (
              <React.Fragment key={task.id}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDelete(task.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <>
                        <span>{task.description}</span>
                        <br />
                        <span>Assigned by: {task.assigned_by_name}</span>
                      </>
                    }
                  />
                </ListItem>
                {idx < tasks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default Dashboard;
