import express from 'express';
import protectRouter from '../middlewares/protectRouter';
import { CreatePost, DeletePost, createcomment, likeUnlikePost, getAllPosts, LikedPosts, getfollowingPosts, getuserPosts } from '../controllers/post.controller.js';

const router = express.Router();

router.get('/likes/:id', protectRouter, LikedPosts);
router.get('/userposts/:username', protectRouter, getuserPosts)
router.get('/following', protectRouter, getfollowingPosts)
router.get('/all', protectRouter, getAllPosts);
router.post('/create', protectRouter, CreatePost);
router.post('/like/:id', protectRouter, likeUnlikePost);
router.post('/comment/:id', protectRouter, createcomment);
router.delete('/delete/:id', protectRouter, DeletePost);

export default router;