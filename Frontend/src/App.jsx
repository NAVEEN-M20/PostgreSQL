import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome"
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import NewTask from "./components/Newtask";
import Chat from "./components/Chat";
import { UserProvider } from "./components/UserProvider";
import Navbar from "./components/NavBar"

function App() {
  return (
    <UserProvider>
      <Router>
        {/* Navbar visible on all pages except Welcome/Login/Register */}
        <Routes>
          <Route
            path="/"
            element={<Welcome />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/newtask" element={<NewTask />} />
                  <Route path="/chat" element={<Chat />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
