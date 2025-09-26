import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Alert,
  Collapse,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${API_URL}/api/register`, form, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res.data.error || "Registration failed");
      }
    } catch (err){
      const msg = err.response?.data?.error || "Server error while logging in";
      setError(msg);
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
        {/* Error & Success Alerts */}
        <Collapse in={!!error}>
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: "10px" }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        </Collapse>
        <Collapse in={!!success}>
          <Alert
            severity="success"
            sx={{ mb: 2, borderRadius: "10px" }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        </Collapse>

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
          error={!!form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)}
          helperText={
            !!form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
              ? "Enter a valid email (e.g., demo@gmail.com)"
              : ""
          }
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
          <MuiLink
            component={Link}
            to="/login"
            sx={{ color: "green", textDecoration: "none", ml: 1 }}
          >
            Login
          </MuiLink>
        </Typography>
      </form>
    </AuthLayout>
  );
};

export default Register;
