import React from "react";
import { Button, Box, Typography } from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { Link } from "react-router-dom";

const Welcome = () => (
  <Box className="welcome_page">
    <Box className="animated-bg" sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <AssignmentIndIcon sx={{ fontSize: 70, color: "white" }} />
      <Typography variant="h3" sx={{ mb: 2, color: "white", textShadow: "0px 2px 8px black" }}>
        Welcome to Task Portal
      </Typography>
      <Box className="welcome_buttons" sx={{ gap: 2 }}>
        <Button component={Link} to="/login" variant="contained" color="success" size="large">Login</Button>
        <Button component={Link} to="/register" variant="contained" color="success" size="large">Register</Button>
      </Box>
    </Box>
  </Box>
);

export default Welcome;
