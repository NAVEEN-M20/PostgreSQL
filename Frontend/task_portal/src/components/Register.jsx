import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box, Alert } from "@mui/material";
const API_URL = import.meta.env.VITE_API_URL;

const Register = ({ setUser }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        // Auto-login after register
        const loginRes = await fetch(`${API_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginData.success && loginData.user) {
          setUser(loginData.user);
          navigate("/dashboard");
        } else {
          setError("Registration succeeded but login failed");
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Server error" + err.message);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2}>Register</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleRegister}>
        <TextField label="Name" fullWidth required margin="normal" value={name} onChange={e => setName(e.target.value)} />
        <TextField label="Email" type="email" fullWidth required margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth required margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
      </form>
      <Button onClick={() => navigate("/login")}>Already have an account? Login</Button>
    </Box>
  );
};

export default Register;
