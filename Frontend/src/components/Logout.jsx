// Logout.jsx
import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const handleYes = async () => {
    try {
      await fetch(import.meta.env.VITE_API_URL + "/api/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      // ignore
    } finally {
      navigate("/");
    }
  };

  const handleNo = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        px: 2, // padding on sides for mobile
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 5,
          borderRadius: 4,
          textAlign: "center",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: { xs: "1.2rem", sm: "2rem" }, // responsive
            letterSpacing: "2px",
            mb: 4,
            color: "#333",
          }}
        >
          Do You Want to Logout?
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(90deg, orange 0%, red 100%)",
              color: "white",
              textTransform: "uppercase",
              fontFamily: "'Rubik', sans-serif",
              fontWeight: 600,
              letterSpacing: "1px",
              px: 4,
              py: 1.5,
              "&:hover": {
                background: "linear-gradient(90deg, #ff9933 0%, #cc0000 100%)",
              },
            }}
            onClick={handleYes}
          >
            Yes
          </Button>

          <Button
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
              color: "white",
              textTransform: "uppercase",
              fontFamily: "'Rubik', sans-serif",
              fontWeight: 600,
              letterSpacing: "1px",
              px: 4,
              py: 1.5,
              "&:hover": {
                background: "linear-gradient(90deg, #1a5ed9 0%, #54189c 100%)",
              },
            }}
            onClick={handleNo}
          >
            No
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
