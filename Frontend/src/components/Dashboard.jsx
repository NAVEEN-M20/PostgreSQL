import React, { useEffect, useState, useContext } from "react";
import { Button, Typography, List, ListItem, ListItemText, Divider, IconButton, Paper } from "@mui/material";
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
        });
        setUser(res.data.user); // update global user from server
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
        withCredentials: true,
      });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <Box>
      <Typography variant="h5">
        Welcome, {user?.name || "User"} 👋
      </Typography>
      <Typography variant="subtitle1">Your Tasks</Typography>
      {tasks.length === 0 ? (
        <Typography>No tasks assigned yet.</Typography>
      ) : (
        <List>
          {tasks.map((task, index) => (
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
              {index < tasks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}

export default Dashboard;
