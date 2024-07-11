import React from 'react';
import io from 'socket.io-client';
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Chat from 'components/Chat/Chat';
import Groups from 'components/Groups/Groups';
import GroupCreate from './components/Groups/Create';
import JoinGroup from './components/Groups/Join'
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";

const socket = io.connect('http://localhost:3002');

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/home"
              element={isAuth ? <HomePage /> : <Navigate to="/" />}
            />
            <Route
              path="/profile/:userId"
              element={isAuth ? <ProfilePage /> : <Navigate to="/" />}
            />
            <Route path="/chats" element={<Chat socket={socket} />} />
            <Route path="/groups" element={<Groups socket={socket} />} />
            <Route path='/groups/create' element={<GroupCreate />} />
            <Route path='/groups/join' element={<JoinGroup />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
