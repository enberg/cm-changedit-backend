import { Request, Response } from "express";
import Post from "../models/Post";

export const create = async (req: Request, res: Response) => {
    const { title, link, body } = req.body;

    const post = new Post({
        title,
        link,
        body,
        author: req.userId
    })

    try {
        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to create post' });
    }
}

export const getAllPosts = async (req: Request, res: Response) => {
    // Vi tar emot två query params, page och limit och ger dem standardvärden
    const { page, limit } = req.query;

    // Vi försäkrar oss om att de är nummer
    const pageAsNumber = parseInt(page?.toString() || '1');
    const limitAsNumber = parseInt(limit?.toString() || '10');

    const posts = await Post.find()
        .populate("author", "userName")
        .limit(limitAsNumber)
        // Vi skippar de inlägg som visats på tidigare sidor
        .skip((pageAsNumber - 1) * limitAsNumber);

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
        posts,
        currentPage: pageAsNumber,
        totalPages: Math.ceil(totalPosts / limitAsNumber)
    });
};

export const getPost = async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await Post.findById(id)
        .populate("author", "userName")
        .populate("comments.author", "userName");

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
};

export const updatePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, link, body } = req.body;

    const post = await Post.findById(id);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    post.title = title;
    post.link = link;
    post.body = body;

    try {
        const savedPost = await post.save();
        res.status(200).json(savedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to update post' });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const deletedPost = await post.deleteOne();
        res.status(204).json(deletedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete post' });
    }
};

export const createComment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { body } = req.body as { body: string };

    const post = await Post.findById(id);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    if (!req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const comment = {
        body,
        author: req.userId
    };

    post.comments.push(comment);

    const updatedPost = await post.save().then(post => post.populate("comments.author", "userName"));

    res.status(201).json(updatedPost);
}

export const deleteComment = async (req: Request, res: Response) => {
    const { id, commentId } = req.params;

    const post = await Post.findById(id);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    comment.deleteOne();

    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
}
