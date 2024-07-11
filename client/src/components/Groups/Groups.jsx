import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  GroupAdd as GroupAddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { setGroups } from '../../state';
import Navbar from 'scenes/navbar';

const Groups = () => {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const [message, setMessage] = useState("");
  const groups = useSelector((state) => state.user.groups || []);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
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
    return `${hours}:${minutes} ${ampm}`;
  };

  const getGroups = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/users/${user._id}/groups`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      dispatch(setGroups({ groups: data }));
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const getMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/groups/${selectedGroup.id}`,
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
    getGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      getMessages();
    }
  }, [selectedGroup]);

  const demoGroups = Array.isArray(groups) ? groups.map((group) => ({
    id: group._id,
    name: `${group.groupName}`,
    description: group.description,
    lastMessage: "Byee.",
    creatorId: group.creatorId
  })) : [];

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
  };

  const handleJoinGroupClick = () => {
    navigate('/groups/join');
  };

  const handleCreateNewGroupClick = () => {
    navigate('/groups/create');
  };

  const handleSendMessage = async () => {
    if (selectedGroup) {
      try {
        const groupMessages = await fetch(
          `http://localhost:3001/groups/${selectedGroup.id}/${user._id}/${message}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const savedMessages = await groupMessages.json();
        if (savedMessages) {
          setMessages([...messages, savedMessages]);
          setMessage("");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <Box
        display="flex"
        flexDirection={isNonMobile ? 'row' : 'column'}
        className="group-container"
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
            placeholder="Search or start a new group"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <List sx={{ bgcolor: 'background.paper', borderRadius: '5px' }}>
            {demoGroups.length > 0 ? (
              demoGroups.map((group) => (
                <ListItem
                  key={group.id}
                  button
                  onClick={() => handleGroupClick(group)}
                  sx={{ '&:hover': { bgcolor: 'grey.100' } }}
                >
                  <ListItemAvatar>
                    <Avatar />
                  </ListItemAvatar>
                  <ListItemText primary={group.name} />
                  {/* <ListItemText primary={group.name} secondary={group.lastMessage} /> */}
                  <ListItemSecondaryAction>
                    {/* <IconButton edge="end" aria-label="group">
                      <GroupAddIcon />
                    </IconButton> */}
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                You did not join any groups yet
              </Typography>
            )}
          </List>
          <Box display="flex" flexDirection="column" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateNewGroupClick}
              sx={{ mb: 2 }}
            >
              Create New Group
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleJoinGroupClick}
            >
              Join a Group
            </Button>
          </Box>
        </Box>
        {selectedGroup && (
          <Box
            className="group-window"
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
              <Typography variant="h6">{selectedGroup.name}</Typography>
            </Box>
            <Box
              className="group-messages"
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
                      flexDirection: msg.senderName === `${user.firstName} ${user.lastName}` ? 'row-reverse' : 'row',
                      alignItems: 'center',
                      my: 1,
                    }}
                  >
                    <Avatar />
                    <Box
                      sx={{
                        ml: msg.senderName === `${user.firstName} ${user.lastName}` ? 2 : 0,
                        mr: msg.senderName === `${user.firstName} ${user.lastName}` ? 0 : 2,
                        bgcolor: msg.senderName === `${user.firstName} ${user.lastName}` ? 'primary.main' : 'grey.300',
                        color: msg.senderName === `${user.firstName} ${user.lastName}` ? 'background.paper' : 'text.primary',
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
                        <SearchIcon />
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

export default Groups;
