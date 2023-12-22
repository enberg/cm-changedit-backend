import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as authController from './contollers/auth';
import * as postsController from './contollers/posts';
import * as commentsController from './contollers/comments';
import * as votesController from './contollers/votes';
import * as filesController from './contollers/files';
import validateToken from "./middleware/validateToken";

const app = express()

app.use(cors());
app.use(express.json());

const upload = multer();

app.post('/register', authController.register);
app.post('/login', authController.logIn);
app.post('/token/refresh', authController.refreshJWT);
app.get('/profile', validateToken, authController.profile);

app.post('/posts', validateToken, upload.single('image'), postsController.create);
app.get('/posts', postsController.getAllPosts);
app.get('/posts/:id', postsController.getPost);
// app.put('/posts/:id', validateToken, postsController.updatePost);
// app.delete('/posts/:id', validateToken, postsController.deletePost);

app.post('/posts/:postId/upvote', validateToken, votesController.upvote);
app.post('/posts/:postId/downvote', validateToken, votesController.downvote);

app.post('/posts/:postId/comments', validateToken, commentsController.createComment);
// app.put('/posts/:postId/comments/:commentId', validateToken, commentsController.updateComment);
app.delete('/posts/:postId/comments/:commentId', validateToken, commentsController.deleteComment);

app.get('/files/:id', filesController.getFileById);

export default app;