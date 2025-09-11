import React, { useEffect, useState } from "react";
import { Button, Typography, List, ListItem, ListItemText, Divider, Box, Alert } from "@mui/material";
const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = ({ user, setUser }) => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setError("");
      try {
        const res = await fetch(`${API_URL}/api/dashboard`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setTasks(data.tasks || []);
        } else {
          setError("Not logged in");
        }
      } catch {
        setError("Server error");
      }
    };
    fetchDashboard();
    // eslint-disable-next-line
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    window.location.href = "/login";
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Typography variant="h5" mb={2}>Welcome, {user.name || user.email} 👋</Typography>
      <Button onClick={handleLogout} variant="outlined" sx={{ mb: 2 }}>Logout</Button>
      <Divider />
      <Typography variant="h6" mt={2}>Your Tasks</Typography>
      <List>
        {tasks.length === 0 && <ListItem><ListItemText primary="No tasks assigned." /></ListItem>}
        {tasks.map(task => (
          <ListItem key={task.id} divider>
            <ListItemText primary={task.title} secondary={task.description} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Dashboard;
