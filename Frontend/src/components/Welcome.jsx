import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();

const Welcome = () => (
  <Box className="welcome_page">
    <Container maxWidth="sm" className="welcome_container">
      <AssignmentIndIcon className="welcome-icon" />
     <Typography
  variant="h3"
  className="welcome-title"
  sx={{ display: "flex", alignItems: "center", gap: 1 }}
>
  Task Portal
 <Typography
  component="span"
  sx={{
    fontFamily: "Orbitron, monospace",
    fontWeight: "bold",
    fontSize: 37,
    letterSpacing: 2,
    background: "linear-gradient(135deg,red,orange,yellow,darkblue)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textFillColor: "transparent",
    display: "inline-block",
  }}
>
  X
</Typography>

</Typography>


      <Box className="welcome_buttons" sx={{ mt: 4 }}>
        <Button
          component={Link}
          to="/login"
          variant="contained"
          color="success"
          size="large"
          className="welcome_button"
        >
          Login
        </Button>
        <Button
          component={Link}
          to="/register"
          variant="contained"
          color="success"
          size="large"
          className="welcome_button"
        >
          Register
        </Button>
      </Box>
      <Typography
        variant="h6"
        sx={{
          color: "white",
          fontWeight: 300,
          maxWidth: 500,
          mt: 2,
          fontFamily: "'Poppins', sans-serif",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Manage your projects and tasks effortlessly with Task Portal. Organize,
        assign, and track your work progress all in one place.
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          color: "white",
          fontWeight: 400,
          maxWidth: 480,
          mt: 3,
          fontFamily: "'Roboto Mono', monospace",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        “Boost productivity, stay organized, and collaborate seamlessly.”
      </Typography>
    </Container>

    <Box component="footer" className="welcome_footer">
      <Typography variant="caption">
        © {currentYear} Task Portal. All rights reserved.
      </Typography>
    </Box>
  </Box>
);

export default Welcome;
