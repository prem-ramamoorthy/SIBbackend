import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  },
  phone_number: {
    type: String,
    required: true,
    maxlength: 20,
    match: /^\+?[0-9]{7,20}$/
  },
  status: {
    type: Boolean,
    required: true
  },
  date_joined: {
    type: Date,
    required: true,
    default: Date.now
  }
},
{
  timestamps: true 
}
);

const User = mongoose.model("users", userSchema);
export default User;