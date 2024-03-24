import mongoose, { Document, Schema } from 'mongoose';

export interface Todo extends Document {
  heading: string;
  status: boolean;
}

const todoSchema = new Schema({
  heading: String,
  status: Boolean,
});

export default mongoose.model<Todo>('Todo', todoSchema);
