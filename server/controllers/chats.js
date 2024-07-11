import User from "../models/User.js";
import Chats from "../models/Chats.js";
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
const app = express();
const upload = multer(); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function getUserName(userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        return `${user.firstName} ${user.lastName}`;
      } else {
        return 'Unknown User';
      }
    } catch (error) {
      console.error('Error retrieving user:', error);
      throw error;
    }
  }

  export const getMessages = async (req, res) => {
    try {
        console.log("goooooooooooooo")
      const { user1Id, user2Id } = req.params;
      const chat = await Chats.findOne({
        $or: [
          { user1Id: user1Id, user2Id: user2Id },
          { user1Id: user2Id, user2Id: user1Id }
        ]
      });
      
      if (!chat) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      const messages = await Promise.all(chat.messages.map(async ({ message, senderId, time }) => {
        // const senderName = await getUserName(senderId);
        return { message, senderId, time };
      }));
  
      res.status(200).json(messages);
    } catch (err) {
      console.error('Error retrieving messages:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  export const sendMessage = async(req, res) => {
    try {
        console.log("Greatttttttt")
        const { user1Id, user2Id, message} = req.params;
        // console.log(req)
        // console.log(chatId, userId, message)
        const chat = await Chats.findOne({
            $or: [
              { user1Id: user1Id, user2Id: user2Id },
              { user1Id: user2Id, user2Id: user1Id }
            ]
          });
          const messageObject = {
            message: message,
            senderId: user1Id,
            time: new Date().toISOString(), 
          };
          if (!chat) {
            console.log("if")
            const newChat = new Chats({
              user1Id,
              user2Id,
              messages: [messageObject]
            })
            const savedChat = await newChat.save();
            console.log(savedChat)
  
            res.status(201).json(savedChat)
          }
          else{
            console.log("else")
            chat.messages.push(messageObject)
            chat.save()
            const formattedChat = chat.map(
              ({
                _id,
                user1Id,
                user2Id,
                messages
              }) => {
                return {
                    _id,
                    user1Id,
                    user2Id,
                    messages
                }
              }
            )
            res.status(200).json(formattedChat);
          }
        //   const messageObject = {
        //     message: message,
        //     senderId: user1Id,
        //     time: new Date().toISOString(), 
        //   };
          
        //   chat.messages.push(messageObject)
        //   console.log(chat.messages, "mmmmmmmmmmmmm")
        //   chat.save()
        //   const formattedChat = chat.map(({ _id, user1Id, user2Id, messages }) => {
        //     return { _id, user1Id, user2Id, messages };
        //   });
          
        // res.status(200).json(formattedChat);
        // }
        
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  }