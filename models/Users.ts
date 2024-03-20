import mongoose, { Document, Schema } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  location: string;
  password: string;
}

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, required: true },
  password: { type: String, required: true },
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
