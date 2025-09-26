import React, { useState, useContext } from "react";
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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AuthLayout from "./AuthLayout";
import axios from "axios";
import { UserContext } from "./UserContext";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/api/login`,
        { email: form.email, password: form.password }, // ✅ fixed to match backend
        { withCredentials: true }
      );

      if (res.data?.success) {
        setUser(res.data.user);
        navigate("/dashboard");
      } else {
        setError(res.data.error || "Login failed"); // use MUI Snackbar/Alert
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Server error while logging in";
      setError(msg); // show proper error from backend
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
          <AccountCircleIcon sx={{ fontSize: 28 }} />
          Login
        </Typography>
      }
      description="Welcome back! Please login to continue managing your projects seamlessly."
    >
      <form onSubmit={handleLogin} noValidate>
        {/* Error Alert */}
        <Collapse in={!!error}>
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: "10px" }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        </Collapse>

        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          required
          autoFocus
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
                  aria-label="toggle password visibility"
                  edge="end"
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
          Login
        </Button>
        <Typography align="center">
          Don&apos;t have an account?{" "}
          <MuiLink
            component={Link}
            to="/register"
            sx={{ color: "green", textDecoration: "none", ml: 1 }}
          >
            Register
          </MuiLink>
        </Typography>
      </form>
    </AuthLayout>
  );
};

export default Login;
