// Register.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { UserContext } from "./UserContext";

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // renamed
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // <-- set user in context so frontend updates immediately
  const { setUser } = useContext(UserContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/api/register`,
        { name, email, password },
        { withCredentials: true }
      );
      if (res.data.success) {
        // set user in context (important)
        setUser(res.data.user);
        navigate("/dashboard");
      } else {
        alert(res.data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while registering");
    }
  };
  return (
    <Box className="account_page">
      <form onSubmit={handleRegister}>
        <Typography variant="h4" align="center" sx={{ mb: 2 }}>
          <SwitchAccountIcon /> Register
        </Typography>
        <TextField
          required
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
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
          Register
        </Button>
        <Typography align="center" sx={{ mt: 2 }}>
          Already registered? <Link to="/login">Login</Link>
        </Typography>
      </form>
    </Box>
  );
};

export default Register;
