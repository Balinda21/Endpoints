import mongoose, { Document, Schema, Model } from 'mongoose';

export interface Comment extends Document {
  text: string;
}

const commentSchema = new Schema<Comment>({

  text: { type: String, required: true },
});

const CommentModel: Model<Comment> = mongoose.model<Comment>('Comment', commentSchema);

export default CommentModel;
