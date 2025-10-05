import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
  },
  usermail: {
    type: String,
    required: true,
    unique: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  displayname: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

export default User ;