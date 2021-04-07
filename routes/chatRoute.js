import express from 'express';
import Chat from '../models/chatModel.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.post('/', async (req, res) => {
	const addChat = new Chat({
		message: req.body.message,
		receiver: req.body.receiver,
		people: [req.body.sender, req.body.receiver],
		sender: req.body.sender,
		status: 'sent',
		msgStatus: 'visible',
	});
	try {
		const chats = await addChat.save();
		if (chats) {
			res.status(200).json({ doc: chats, exists: true });
		} else {
			res.status(200).json({ exists: false });
		}
	} catch (e) {
		console.log(e);
		res.status(404).json(e);
	}
});

router.post(
	'/getchats',
	asyncHandler(async (req, res) => {
		try {
			const chats = await Chat.find(
				{
					people: { $all: [req.body.uid, req.body.fid] },
				},
				null,
				{ sort: { createdAt: -1 } }
			);
			if (chats) {
				res.status(200).json({ doc: chats, exists: true });
			} else {
				res.status(200).json({ exists: false });
			}
		} catch (e) {
			console.log(e);
			res.status(404).json(e);
		}
	})
);

export default router;
