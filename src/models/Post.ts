import { Document, Model, Schema, Types, model } from "mongoose";

interface IComment extends Document {
    body: string;
    author: Types.ObjectId;
}

const CommentSchema = new Schema<IComment>({
    body: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

interface IPost extends Document {
    title: string;
    link?: string;
    body?: string;
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    comments: IComment[];
}

interface PostProps {
    comments: Types.DocumentArray<IComment>;
}

type PostModel = Model<IPost, {}, PostProps>;

const PostSchema = new Schema<IPost, PostModel> ({
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
    },
    comments: [CommentSchema]
}, {
    timestamps: true
});

const Post = model<IPost, PostModel>('Post', PostSchema);

export default Post;

