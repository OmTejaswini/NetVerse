import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Group from '../models/Groups.js'
import User from '../models/User.js'
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
const app = express();
const upload = multer(); // Create a multer instance for parsing multipart/form-data

app.use(bodyParser.json()); // Parse application/json
app.use(bodyParser.urlencoded({ extended: true }));

async function getUserName(senderId) {
  try {
    const user = await User.findById(senderId);
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
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const messages = await Promise.all(group.messages.map(async ({ message, senderId, time }) => {
      const senderName = await getUserName(senderId);
      return { message, senderName, time };
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
      const { groupId, userId, message} = req.params;
      // console.log(req)
      console.log(groupId, userId, message)
      const group = await Group.findById(groupId);
      console.log(group)

        const messageObject = {
          message: message,
          senderId: userId,
          time: new Date().toISOString(), 
        };
        
        group.messages.push(messageObject)
        console.log(group.messages, "mmmmmmmmmmmmm")
        group.save()
        const formattedGroup = group.map(
          ({ _id, groupName,
              creatorId,
              picturePath,
              members,
              messages,
              description}) => {
            return { _id, groupName,
              creatorId,
              picturePath,
              members,
              messages,
              description };
          }
        );
      res.status(200).json(formattedGroup);
      // }
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

export const createGroup = async(req, res) => {
    // try {
        const { groupName, userId, picturePath, description, secretPasscode } = req.body;
        console.log(groupName, userId, picturePath, description, secretPasscode, "dataaaaaaaaaaaa")
        const salt = await bcrypt.genSalt();
        const secretPasscodeHash = await bcrypt.hash(secretPasscode, salt);
        const user = await User.findById(userId);
        console.log("zzzzzzzzz")
        const newGroup = new Group({
          groupName,
          creatorId: userId,
          picturePath: picturePath[1],
          members: [userId],
          messages: [],
          description,
          secretPasscode: secretPasscodeHash,
        });
        console.log("hiiiiiiiii9999999999")
        const savedGroup = await newGroup.save();
        console.log(savedGroup._id, "sssssss")
        const groupId = savedGroup._id 
        user.groups.push(groupId)
        await user.save()
        res.status(201).json(savedGroup);
      // } catch (error) {
      //   console.log("here!!!")
      //   res.status(500).json({ error: error.message });
      // }
}

export const joinGroup = async(req, res) => {
    try {
      // console.log(req, "reqqqqqqqqqqqqqqq")
        const { groupId, secretPasscode, userId } = req.params;
        console.log("hello from join function")
        console.log(req)
        // const {  } = await req.body;
        // Find the group by ID
        const group = await Group.findById(groupId);
        const user = await User.findById(userId);
        console.log(groupId, userId, secretPasscode)

        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }
        
        const isMatch = await bcrypt.compare(secretPasscode, group.secretPasscode);
        if(!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

        // Check if the user is already a member
        if (group.members.includes(userId)) {
          return res.status(400).json({ message: "User is already a member of this group" });
        }
    
        // Add user to the group's members array
        user.groups.push(groupId)
        group.members.push(userId);
        await user.save();
        await group.save();
        const groups = await Promise.all(
            user.groups.map((id) => Group.findById(id))
          );
        const formattedGroups = groups.map(
            ({ _id, groupName,
                creatorId,
                picturePath,
                members,
                messages,
                description}) => {
              return { _id, groupName,
                creatorId,
                picturePath,
                members,
                messages,
                description };
            }
          );
        res.status(200).json(formattedGroups);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}