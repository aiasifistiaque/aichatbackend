import express from 'express';
import User from '../models/userModel.js';

const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({ name: 'Name' });
});

export default router;
