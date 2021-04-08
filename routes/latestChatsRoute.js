import express from 'express';
import LatestChat from '../models/latestChatModel.js';

const router = express.Router();

router.get('/', (req, res) => {});

router.post('/', async (req, res) => {
	try {
		const query = await LatestChat.find({ user: req.body.uid }, null, {
			sort: { updatedAt: -1 },
		});

		if (query.length > 0) {
			res.status(200).json({ doc: query, exists: true });
		} else {
			res.status(200).json({ exists: false });
		}
	} catch (e) {
		console.log(e.message);
		res.status(404);
	}
});

export default router;
