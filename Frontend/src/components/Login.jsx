import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import { UserContext } from "./UserContext";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/api/login`,
        { username: email, password },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setUser(res.data.user); // update user context
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
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Login
      </Typography>
      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          sx={{ mb: 2 }}
          type="email"
          fullWidth
        />
        <TextField
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{ mb: 3 }}
          type="password"
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
      </form>
      <Typography sx={{ mt: 2 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </Typography>
    </Box>
  );
};

export default Login;
