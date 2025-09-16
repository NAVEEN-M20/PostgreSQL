import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

const currentYear = new Date().getFullYear();

const AuthLayout = ({ children, title, description }) => (
  <Box className="auth-abs-root">
    {/* Absolute, full-page background image */}
    <Box className="auth-bg-image" />

    {/* Main flex layout, position relative and fills full space */}
    <Box className="auth-root">
      {/* LEFT: Gradient panel, all content in center, higher z-index */}
      <Box className="auth-left">
        <Box className="auth-left-inner">
          <AssignmentIndIcon className="auth-logo" />
          <Typography variant="h5" className="auth-welcome-title">
            Welcome to
          </Typography>
          <Typography variant="h4" className="auth-brand" sx={{ fontWeight: 700, mb: 2 }}>
            Task Portal
          </Typography>
          <Typography className="auth-desc">{description}</Typography>
        </Box>
        <Typography className="auth-footer">
          © {currentYear} Task Portal. All rights reserved.
        </Typography>
      </Box>

      {/* RIGHT: Just the form (nothing else), fully transparent background */}
      <Box className="auth-right">
        <Paper className="auth-card" elevation={7}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            {title}
          </Typography>
          {children}
        </Paper>
      </Box>
    </Box>
  </Box>
);

export default AuthLayout;
