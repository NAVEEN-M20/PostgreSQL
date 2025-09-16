import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt"; // Icon for Register form
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const togglePasswordVisibility = () => setShowPassword(p => !p);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/register`, form);
      if (res.data?.success) {
        alert("Registration successful! Please log in.");
        navigate("/login");
      } else {
        alert(res.data.error || "Registration failed");
      }
    } catch {
      alert("Server error while registering");
    }
  };

  return (
    <AuthLayout
     title={
    <Typography
      variant="h5"
      sx={{
        fontWeight: 600,
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",   
        gap: 1,
        width: "100%",             
        textAlign: "center",        
      }}
    >
          <PersonAddAltIcon sx={{ fontSize: 28 }} />
          Register
        </Typography>
      }
      description="Manage your projects and tasks effortlessly with Task Portal."
    >
      <form onSubmit={handleRegister} noValidate>
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
          autoFocus
          sx={{ mb: 2, background: "#fafbff", borderRadius: "10px" }}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2, background: "#fafbff", borderRadius: "10px" }}
        />
        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 3, background: "#fafbff", borderRadius: "10px" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={togglePasswordVisibility}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          type="submit"
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
          Register
        </Button>
        <Typography align="center">
          Already registered?{" "}
          <MuiLink component={Link} to="/login" sx={{ color: "green" ,textDecoration:"none",ml:15}}>
            Login
          </MuiLink>
        </Typography>
      </form>
    </AuthLayout>
  );
};

export default Register;
