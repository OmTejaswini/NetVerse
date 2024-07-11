import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
      user1Id: {
        type: String,
        required: true,
      },
      user2Id: {
        type: String,
        required: true,
      },
      messages:{
        type: Array,
        default: []
      }
    },
    { timestamps: true }
  );
  
  const Chats = mongoose.model("Chats", ChatSchema);
  export default Chats;