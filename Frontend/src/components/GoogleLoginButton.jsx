// src/components/GoogleLoginButton.jsx
import React from "react";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // Hit backend OAuth route → redirects to Google
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      sx={{
        mt: 2,
        textTransform: "none",
        fontWeight: 500,
        borderRadius: 2,
        "&:hover": {
          backgroundColor: "#fce8e6",
          borderColor: "#db4437",
        },
      }}
    >
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;
