import express from 'express';
import protectRouter from '../middlewares/protectRouter';
import { getProfile, followunfollow, getSuggestedUsers, updateUser } from '../controllers/user.controller.js';


const router = express.Router();

// User routes
router.get('/profile/:username', protectRouter, getProfile);
router.post('/follow/:id', protectRouter, followunfollow);
router.get('/suggested', protectRouter, getSuggestedUsers )
router.post('/update', protectRouter, updateUser);

export default router;