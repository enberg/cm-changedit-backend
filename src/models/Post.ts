import { Document, Model, Schema, Types, model } from "mongoose";

interface IComment extends Document {
    body: string;
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
    body: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

interface IPost extends Document {
    title: string;
    link?: string;
    body?: string;
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    comments: IComment[]
}

interface IPostProps {
    comments: Types.DocumentArray<IComment>;
}

type IPostModel = Model<IPost, {}, IPostProps>;

const PostSchema = new Schema<IPost, IPostModel> ({
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

const Post = model<IPost, IPostModel>('Post', PostSchema);

export default Post;

