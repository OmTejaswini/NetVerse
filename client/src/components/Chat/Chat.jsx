import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  PersonAddOutlined,
  Message as MessageIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from '../../state';
import Navbar from 'scenes/navbar';

const Chat = () => {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const [message, setMessage] = useState("");
  const friends = useSelector((state) => state.user.friends);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const theme = useTheme();
  const isNonMobile = useMediaQuery(theme.breakpoints.up('sm'));

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedTime = `${hours}:${minutes} ${ampm}`;
    return formattedTime;
  };

  const getUsers = async (query) => {
    const response = await fetch(
      `http://localhost:3001/users/search/${query}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    return data;
  };

  const getFriends = async () => {
    const response = await fetch(
      `http://localhost:3001/users/${user._id}/friends`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    dispatch(setFriends({ friends: data }));
  };

  useEffect(() => {
    getFriends();
  }, []);

  const demoChats = friends.map((friend) => ({
    id: friend._id,
    name: `${friend.firstName} ${friend.lastName}`,
    lastMessage: "Byee.",
  }));

  const getMessages = async (chatId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/chats/${user._id}/${chatId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      getMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async () => {
    if (selectedChat) {
      try {
        const response = await fetch(
          `http://localhost:3001/chats/${user._id}/${selectedChat.id}/${message}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const savedMessage = await response.json();
        setMessages([...messages, savedMessage]);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleSearchChange = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      const results = await getUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div>
      <Navbar />
      <Box
        display="flex"
        flexDirection={isNonMobile ? 'row' : 'column'}
        className="chat-container"
        sx={{ width: '100%', height: `calc(100vh - 64px)`, bgcolor: 'background.default' }}
      >
        <Box
          className="sidebar"
          flex={1}
          maxWidth={isNonMobile ? '300px' : '100%'}
          p="20px"
          bgcolor={theme.palette.background.default}
          sx={{
            borderRight: isNonMobile ? `1px solid ${theme.palette.divider}` : 'none',
            borderBottom: isNonMobile ? 'none' : `1px solid ${theme.palette.divider}`,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search or start a new chat"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {searchQuery && searchResults.length > 0 ? (
            <List sx={{ bgcolor: 'background.paper', borderRadius: '5px' }}>
              {searchResults.map((user) => (
                <ListItem key={user._id} disablePadding>
                  <ListItemAvatar>
                    <Avatar />
                  </ListItemAvatar>
                  <ListItemText primary={`${user.firstName} ${user.lastName}`} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="add">
                      <PersonAddOutlined />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <List sx={{ bgcolor: 'background.paper', borderRadius: '5px' }}>
              {demoChats.length > 0 ? (
                demoChats.map((chat) => (
                  <ListItem
                    key={chat.id}
                    button
                    onClick={() => handleChatClick(chat)}
                    sx={{ '&:hover': { bgcolor: 'grey.100' } }}
                  >
                    <ListItemAvatar>
                      <Avatar />
                    </ListItemAvatar>
                    <ListItemText primary={chat.name} />
                    {/* <ListItemText primary={chat.name} secondary={chat.lastMessage} /> */}
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  You did not join any chats yet
                </Typography>
              )}
            </List>
          )}
        </Box>
        {selectedChat && (
          <Box
            className="chat-window"
            flex={3}
            p="20px"
            bgcolor={theme.palette.background.alt}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #ddd' }}>
              <Typography variant="h6">{selectedChat.name}</Typography>
            </Box>
            <Box
              className="chat-messages"
              flex={1}
              overflow="auto"
              px={2}
              sx={{ display: 'flex', flexDirection: 'column' }}
            >
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: msg.senderId === user._id ? 'row-reverse' : 'row',
                      alignItems: 'center',
                      my: 1,
                    }}
                  >
                    <Avatar />
                    <Box
                      sx={{
                        ml: msg.senderId === user._id ? 2 : 0,
                        mr: msg.senderId === user._id ? 0 : 2,
                        bgcolor: msg.senderId === user._id ? 'primary.main' : 'grey.300',
                        color: msg.senderId === user._id ? 'background.paper' : 'text.primary',
                        px: 2,
                        py: 1,
                        borderRadius: '10px',
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTime(msg.time)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  No messages yet
                </Typography>
              )}
            </Box>
            <Box sx={{ p: 2, borderTop: '1px solid #ddd' }}>
              <TextField
                fullWidth
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={handleSendMessage}>
                        <MessageIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default Chat;
