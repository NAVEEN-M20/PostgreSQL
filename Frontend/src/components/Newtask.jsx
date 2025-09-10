// Newtask.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, TextField, Typography,
  Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import axios from "axios";
const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

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
    <Box className="newtask_page">
      <Box className="taskform-container">
        <Typography variant="h5" sx={{ mb: 3 }}>Assign a new task</Typography>
        <form onSubmit={handleTaskSubmit}>
          <TextField label="Title" required fullWidth sx={{ mb: 2 }} value={title} onChange={e => setTitle(e.target.value)} />
          <TextField label="Description" required fullWidth multiline rows={3} sx={{ mb: 2 }} value={description} onChange={e => setDescription(e.target.value)} />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="assign-user-label">Assign to</InputLabel>
            <Select
              labelId="assign-user-label"
              value={assignedTo}
              label="Assign to"
              onChange={e => setAssignedTo(e.target.value)}
              required>
              {users.map(u => (
                <MenuItem key={u.id} value={u.id}>
                  {u.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Create Task
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default NewTask;
