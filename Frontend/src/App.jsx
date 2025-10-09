import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import NewTask from "./components/NewTask.jsx";
import Chat from "./components/Chat";
import Logout from "./components/Logout";
import { UserProvider } from "./components/UserProvider";
import NavBar from "./components/NavBar";
import ThemeModeProvider from "./components/ThemeContext.jsx";

function App() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  return (
    <ThemeModeProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <>
                  <NavBar />
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/newtask" element={<NewTask />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/logout" element={<Logout />} />
                  </Routes>
                </>
              }
            />
          </Routes>
        </Router>
      </UserProvider>
    </ThemeModeProvider>
  );
}

export default App;
