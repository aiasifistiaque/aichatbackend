import express from 'express';
import LatestChat from '../models/latestChatModel.js';
import { io } from '../server.js';

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

router.put('/changestatus', async (req, res) => {
	const { user, friend } = req.body;

	//console.log('i am here now', req.body);

	const findReceiver = await LatestChat.findOne({
		user: user,
		friend: friend,
	});

	if (findReceiver) {
		//console.log(findReceiver);
		if (findReceiver.isSender) {
			res.status(200).json({ changed: false, error: true });
		}

		findReceiver.status = 'seen';
		const query = await findReceiver.save();
		if (query) {
			console.log(query);
			io.of('/users')
				.to(`activechats${query.user}`)
				.emit('updateactivechats', query);
		}

		res.status(200).json({ changed: true, error: false });
	} else {
		res.status(404).json({ changed: false, error: true });
	}
});

export default router;
