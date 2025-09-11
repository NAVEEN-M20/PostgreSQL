import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Select, MenuItem, InputLabel, FormControl, Alert } from "@mui/material";
const API_URL = import.meta.env.VITE_API_URL;

const Newtask = ({ user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      const res = await fetch(`${API_URL}/api/users`, { credentials: "include" });
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, [user]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/task/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, assigned_to: assignedTo }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Task created!");
        navigate("/dashboard");
      } else {
        setError(data.error || "Error creating task");
      }
    } catch {
      setError("Server error creating task");
    }
  };

  if (!user) return <Box p={4}>Login to assign tasks.</Box>;

  return (
    <Box maxWidth={500} mx="auto" mt={6}>
      <Typography variant="h5" mb={2}>Assign a new task</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleTaskSubmit}>
        <TextField label="Title" required fullWidth sx={{ mb: 2 }} value={title} onChange={e => setTitle(e.target.value)} />
        <TextField label="Description" required fullWidth multiline rows={3} sx={{ mb: 2 }} value={description} onChange={e => setDescription(e.target.value)} />
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="assign-user-label">Assign to</InputLabel>
          <Select labelId="assign-user-label" value={assignedTo} label="Assign to" onChange={e => setAssignedTo(e.target.value)} required>
            {users.map(u => (
              <MenuItem key={u.id} value={u.id}>{u.name || u.email}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" fullWidth>Create Task</Button>
      </form>
    </Box>
  );
};

export default Newtask;
