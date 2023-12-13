import { Request, Response } from "express";
import Post from "../models/Post";
import { get } from "mongoose";

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

    const post = await Post.findById(id).populate("author", "userName");

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
};