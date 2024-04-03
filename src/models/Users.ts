import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean; // Add isAdmin property
  role:string;
  
}

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // Default value is false
  role: { type: String, enum: ['admin', 'user'], default: 'user' } 
});

const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;
