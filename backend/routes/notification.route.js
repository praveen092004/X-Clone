import express from 'express';
import protectRouter from '../middlewares/protectRouter';
import { getNotification, deleteNotification } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', protectRouter, getNotification);
router.delete('/', protectRouter, deleteNotification);

export default router;