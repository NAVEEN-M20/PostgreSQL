import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  Input,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const NewTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectOpen, setSelectOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const selectRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          setUsers(res.data);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_URL}/api/task/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, assigned_to: assignedTo }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Task created successfully!");
        setTimeout(() => navigate("/dashboard"), 1500); // Redirect after a short delay
      } else {
        setError(data.error || "Error creating task");
      }
    } catch {
      setError("Server error creating task");
    }
  };

  const handleDeleteUser = (userIdToDelete) => {
    setAssignedTo(assignedTo.filter(id => id !== userIdToDelete));
  };

  const handleSelectChange = (event) => {
    setAssignedTo(event.target.value);
  };

  const handleSelectOpen = () => {
    setSelectOpen(true);
  };

  const handleSelectClose = () => {
    setSelectOpen(false);
  };

  if (!users) return <Box p={4}>Login to assign tasks.</Box>;

  return (
    <Box
      display="flex"
      justifyContent="center"
      sx={{ 
        m: isMobile ? 2 : 7, 
        borderRadius: "20px" 
      }}
    >
      <Paper
        sx={{
          p: isMobile ? 3 : 4,
          width: isMobile ? "100%" : 400,
          maxWidth: "90vw",
          boxShadow: "0px 2px 6px black",
          borderRadius: "30px",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            fontStyle: "italic",
            fontWeight: "bolder",
            mb: 4,
            background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Assign a new task
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <form onSubmit={handleTaskSubmit}>
          <TextField
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
            autoFocus
          />
          <TextField
            label="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            sx={{ 
              mb: 2,
              // Remove scrollbar from description
              "& .MuiOutlinedInput-root": {
                "& textarea": {
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }
              }
            }}
            required
            multiline
            rows={3}
          />
          
          {/* Assigned Users Display */}
          <Box
            sx={{
              border: "1px solid #c4c4c4",
              borderRadius: "4px",
              padding: "16.5px 14px",
              minHeight: "56px",
              mb: 2,
              backgroundColor: "transparent",
              // Scrollable container for chips with hidden scrollbar
              maxHeight: "120px",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              alignItems: "flex-start",
            }}
          >
            {assignedTo.length === 0 ? (
              <Typography 
                variant="body1" 
                color="textSecondary"
                sx={{ fontStyle: "italic" }}
              >
                No users assigned yet
              </Typography>
            ) : (
              assignedTo.map((userId) => {
                const user = users.find(u => u.id === userId);
                if (!user) return null;
                
                return (
                  <Chip
                    key={userId}
                    label={user.name}
                    onDelete={() => handleDeleteUser(userId)}
                    deleteIcon={
                      <CancelIcon 
                        sx={{ 
                          color: "white",
                          "&:hover": {
                            color: "#ffcccc"
                          }
                        }} 
                      />
                    }
                    sx={{
                      background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      height: "28px",
                      "& .MuiChip-deleteIcon": {
                        margin: "0 4px 0 -4px",
                        fontSize: "18px",
                      },
                      "& .MuiChip-label": {
                        paddingLeft: "12px",
                        paddingRight: "8px",
                      },
                      "&:hover": {
                        background: "linear-gradient(90deg, #1b47ae 0%, #571e96 100%)",
                      },
                    }}
                  />
                );
              })
            )}
          </Box>

          {/* User Selection Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="assign-label">Assign users</InputLabel>
            <Select
              ref={selectRef}
              labelId="assign-label"
              multiple
              value={assignedTo}
              label="Assign users"
              onChange={handleSelectChange}
              open={selectOpen}
              onOpen={handleSelectOpen}
              onClose={handleSelectClose}
              MenuProps={{
                PaperProps: {
                  sx: {
                    marginTop: 1,
                    maxHeight: isMobile ? 200 : 300,
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none", // IE and Edge
                    overflowY: "auto",
                    minWidth: "calc(100% - 32px)",
                    borderRadius: "12px",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                    border: "1px solid #e0e0e0",
                  },
                },
                disableScrollLock: false,
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
              }}
            >
              {users.map((u) => (
                <MenuItem 
                  key={u.id} 
                  value={u.id}
                  sx={{
                    // Prevent text wrapping and overflow
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    py: 1,
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      background:
                        "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {u.name}
                  </span>{" "}
                  ({u.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
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
            Create Task
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default NewTask;