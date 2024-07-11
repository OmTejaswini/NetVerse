import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
    {
      groupName: {
        type: String,
        required: true,
        min: 2,
        max: 100,
      },
      creatorId: {
        type: String,
        required: true,
      },
      picturePath: {
        type: String,
        default: "",
      },
      members: {
        type: Array,
        default: [],
      },
      messages:{
        type: Array,
        default: []
      },
      description: String,
      secretPasscode: String,
    },
    { timestamps: true }
  );
  
  const Group = mongoose.model("Group", GroupSchema);
  export default Group;