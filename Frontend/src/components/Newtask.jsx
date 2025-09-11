import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper
} from "@mui/material";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const NewTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users`, { withCredentials: true });
        if (res.status === 200) {
          setUsers(res.data);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/api/task/new`,
        { title, description, assigned_to: assignedTo },
        { withCredentials: true }
      );
      if (res.data.success) {
        alert("Task created!");
        navigate("/dashboard");
      } else {
        alert(res.data.error || "Error creating task");
      }
    } catch (err) {
      console.error(err);
      alert("Server error creating task");
    }
  };

  return (
    <Box display="flex" justifyContent="center">
      <Paper sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Assign a new task
        </Typography>
        <form onSubmit={handleTaskSubmit}>
          <TextField label="Task Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth sx={{ mb: 2 }} required />
          <TextField label="Task Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth sx={{ mb: 2 }} required />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="assign-label">Assign to</InputLabel>
            <Select
              labelId="assign-label"
              value={assignedTo}
              label="Assign to"
              onChange={e => setAssignedTo(e.target.value)}
              required
            >
              {users.map(u => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Create Task
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default NewTask;
