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

interface Photo {
    mimeType: string;
    size: number;
    id: Types.ObjectId;
}

interface IPost extends Document {
    title: string;
    link?: string;
    body?: string;
    photo?: Photo;
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
    upvote: (userId: string) => void;
    downvote: (userId: string) => void;
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
    photo: {
        mimeType: {
            type: String,
        },
        size: {
            type: Number,
        },
        id: {
            type: Schema.Types.ObjectId,
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [CommentSchema],
    upvotes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    downvotes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    score: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

PostSchema.method('upvote', async function(this: IPost, userId: string) {
    const userIdObject = new Types.ObjectId(userId);

    if (this.upvotes.includes(userIdObject)) {
        return;
    } else if (this.downvotes.includes(userIdObject)) {
        this.downvotes.pull(userIdObject);
    }

    this.upvotes.push(userIdObject);
})

PostSchema.method('downvote', async function(this: IPost, userId: string) {
    const userIdObject = new Types.ObjectId(userId);

    if (this.downvotes.includes(userIdObject)) {
        return;
    } else if (this.upvotes.includes(userIdObject)) {
        this.upvotes.pull(userIdObject);
    }

    this.downvotes.push(userIdObject);
})

PostSchema.pre<IPost>('save', function(next) {
    if (this.isModified('upvotes') || this.isModified('downvotes')) {
        this.score = this.upvotes.length - this.downvotes.length;
    }

    next();
});

const Post = model<IPost, IPostModel>('Post', PostSchema);

export default Post;

