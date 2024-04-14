import mongoose, { Schema } from 'mongoose';
const commentSchema = new Schema({
    text: { type: String, required: true },
});
const CommentModel = mongoose.model('Comment', commentSchema);
export default CommentModel;
//# sourceMappingURL=comments.js.map