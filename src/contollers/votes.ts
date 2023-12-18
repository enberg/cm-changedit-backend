import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Post from '../models/Post';
import { assertDefined } from '../util/asserts';

export const upvote = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { userId } = req;
    assertDefined(userId);

    const post = await Post.findById(postId);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    const userIdObject = new Types.ObjectId(userId);
    
    post.upvote(userIdObject);

    const upvotedPost = await post.save();

    res.status(200).json(upvotedPost);
}

export const downvote = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { userId } = req;
    assertDefined(userId);

    const post = await Post.findById(postId);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    const userIdObject = new Types.ObjectId(userId);

    post.downvote(userIdObject);

    const downvotedPost = await post.save();

    res.status(200).json(downvotedPost);
}