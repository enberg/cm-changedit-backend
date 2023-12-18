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
    comments: IComment[];
    upvotes: Types.Array<Types.ObjectId>;
    downvotes: Types.Array<Types.ObjectId>;
    score: number;
}

interface IPostProps {
    comments: Types.DocumentArray<IComment>;
    upvote: (userId: Types.ObjectId) => void;
    downvote: (userId: Types.ObjectId) => void;
}

type IPostModel = Model<IPost, {}, IPostProps>;

const PostSchema = new Schema<IPost, IPostModel>({
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
    comments: {
        type: [CommentSchema],
    },
    upvotes: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
    },
    downvotes: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
    },
    score: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

PostSchema.method('upvote', async function (this: IPost, userId: Types.ObjectId) {
    if (this.upvotes.includes(userId)) {
        return;
    }

    if (this.downvotes.includes(userId)) {
        this.downvotes.pull(userId);
    }

    this.upvotes.push(userId);
});

PostSchema.method('downvote', async function (this: IPost, userId: Types.ObjectId) {
    if (this.downvotes.includes(userId)) {
        return;
    }

    if (this.upvotes.includes(userId)) {
        this.upvotes.pull(userId);
    }

    this.downvotes.push(userId);
});

PostSchema.pre<IPost>('save', function (next) {
    // Om vi har ändrat upvotes eller downvotes så vill vi uppdatera score
    if (this.isModified('upvotes') || this.isModified('downvotes')) {
        this.score = this.upvotes.length - this.downvotes.length;
    }

    next();
});

const Post = model<IPost, IPostModel>('Post', PostSchema);

export default Post;

