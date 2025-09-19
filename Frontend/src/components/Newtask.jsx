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
  Paper,
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
        const res = await axios.get(`${API_URL}/api/users`, {
          withCredentials: true,
        });
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
    <Box
      display="flex"
      justifyContent="center"
      sx={{ m: 7, borderRadius: "20px" }}
    >
      <Paper
        sx={{
          p: 4,
          minWidth: 350,
          boxShadow: "0px 2px 6px black",
          borderRadius: "30px",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontStyle: "italic", fontWeight: "bolder", mb: 4 ,background:
                        "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent", }}
        >
          Assign a new task
        </Typography>
        <form onSubmit={handleTaskSubmit}>
          <TextField
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
            autoFocus
          />
          <TextField
            label="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="assign-label">Assign to</InputLabel>
            <Select
              labelId="assign-label"
              value={assignedTo}
              label="Assign to"
              onChange={(e) => setAssignedTo(e.target.value)}
              required
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  <span
                    style={{
                      fontWeight: "bold",
                      background:
                        "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {u.name}
                  </span>{" "}
                  ({u.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: "20px",
              background: "linear-gradient(90deg,#2575fc 0%,#6a11cb 100%)",
              fontWeight: 600,
              fontSize: "1.1rem",
              textTransform: "none",
              mb: 2,
              boxShadow: "0 6px 20px rgba(37,117,252,0.15)",
              "&:hover": {
                background: "linear-gradient(90deg,#1b47ae 0%,#571e96 100%)",
              },
            }}
          >
            Create Task
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default NewTask;
