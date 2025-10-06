import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import GoogleIcon from "@mui/icons-material/Google";
import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      sx={{
        textTransform: "none",
        fontWeight: 500,
        borderRadius: 2,
        py: 1.5,
        borderColor: "#dadce0",
        color: "#3c4043",
        backgroundColor: "white",
        fontSize: { xs: "0.95rem", md: "1rem" },
        "&:hover": {
          backgroundColor: "#f8f9fa",
          borderColor: "#dadce0",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        },
      }}
    >
      Continue with Google
    </Button>
  );
};

/* Divider that shows OR inside a circle (vertical on desktop, horizontal on mobile) */
const OrCircleDivider = () => {
  const circleSize = 56;

  return (
    <>
      {/* Desktop / md+ : vertical line with centered circular OR */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          minWidth: `${circleSize}px`,
          width: `${circleSize}px`,
          height: "100%", // parent determines height; this will stretch to match siblings
        }}
      >
        {/* vertical line centered */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: "1px",
            transform: "translateX(-50%)",
            bgcolor: "rgba(255,255,255,0.18)",
          }}
        />
        {/* circular OR */}
        <Box
          sx={{
            zIndex: 2,
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.9rem",
              letterSpacing: 1,
              color: "white",
            }}
          >
            OR
          </Typography>
        </Box>
      </Box>

      {/* Mobile / xs-sm : horizontal line with circular OR overlapped in center */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: "100%",
          my: 2,
        }}
      >
        {/* horizontal line */}
        <Box
          sx={{
            width: "80%",
            height: "1px",
            bgcolor: "rgba(255,255,255,0.18)",
          }}
        />
       
        <Box
          sx={{
            position: "absolute",
            zIndex: 2,
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.9rem",
              letterSpacing: 1,
              color: "white",
            }}
          >
            OR
          </Typography>
        </Box>
      </Box>
    </>
  );
};

const Welcome = () => (
  <Box className="welcome_page">
    <Container maxWidth="md" className="welcome_container">
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

      <Box
        sx={{
          mt: 5,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: { xs: "100%", md: "auto" },
            minWidth: { xs: "80%", md: 220 },
            alignItems: "center",
          }}
        >
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="success"
            size="large"
            className="welcome_button"
            sx={{
              py: 1.5,
              width: "100%",
              fontSize: { xs: "0.95rem", md: "1rem" },
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
              "&:hover": {
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              },
            }}
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
            sx={{
              py: 1.5,
              width: "100%",
              fontSize: { xs: "0.95rem", md: "1rem" },
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
              "&:hover": {
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              },
            }}
          >
            Register
          </Button>
        </Box>

        <OrCircleDivider />

        <Box
          sx={{
            width: { xs: "80%", md: "auto" },
            minWidth: { md: 220 },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <GoogleLoginButton />
        </Box>
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: "white",
          fontWeight: 300,
          maxWidth: 500,
          mt: 5,
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
        "Boost productivity, stay organized, and collaborate seamlessly."
      </Typography>
    </Container>

    <Box component="footer" className="welcome_footer">
      <Typography variant="caption">© {currentYear} Task Portal. All rights reserved.</Typography>
    </Box>
  </Box>
);

export default Welcome;
