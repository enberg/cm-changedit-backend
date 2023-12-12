import { Document, Schema, Types, model } from "mongoose";

interface IPost extends Document {
    title: string;
    link?: string;
    body?: string;
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost> ({
    title: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    body: {
        type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

const Post = model<IPost>('Post', PostSchema);

export default Post;

