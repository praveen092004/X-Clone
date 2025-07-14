import express from 'express';
import { signup, login, logout, getme } from '../controllers/auth.controller.js';
import protectRouter from '../middlewares/protectRouter';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protectRouter, getme);

export default router;