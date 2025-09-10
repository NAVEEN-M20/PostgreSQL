// Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const Login = () => {
  const [email, setEmail] = useState(""); // renamed
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
  `${API_URL}/api/login`,
        { username: email, password }, // passport-local expects username param
        { withCredentials: true }
      );
      if (res.data?.success) {
        navigate("/dashboard");
      } else {
        alert(res.data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while logging in");
    }
  };

  return (
    <Box className="account_page">
      <form onSubmit={handleLogin}>
        <Typography variant="h4" align="center" sx={{ mb: 2 }}>
          <AccountCircleIcon /> Login
        </Typography>
        <TextField
          required
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
          type="email"
        />
        <TextField
          required
          label="Password"
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Button variant="contained" type="submit" fullWidth size="large">
          Login
        </Button>
        <Typography align="center" sx={{ mt: 2 }}>
          Don't have an account? <Link to="/register">Register</Link>
        </Typography>
      </form>
    </Box>
  );
};

export default Login;
