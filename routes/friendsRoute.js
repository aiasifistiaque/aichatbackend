import express from 'express';
import asyncHandler from 'express-async-handler';

import Friend from '../models/friendModel.js';

const router = express.Router();

router.post(
	'/',
	asyncHandler(async (req, res) => {
		try {
			const query = await Friend.findOne({
				users: { $all: [req.body.userid, req.body.friendid] },
			});

			if (query) {
				res.status(200).json({ status: query, exists: true });
			} else {
				res.status(200).json({ status: null, exists: false });
			}
		} catch (e) {
			console.log(e.message);
		}
	})
);

router.post(
	'/add',
	asyncHandler(async (req, res) => {
		const newfriend = new Friend({
			sender: req.body.sender,
			receiver: req.body.receiver,
			status: 'pending',
			senderStatus: 'added',
			receiverStatus: 'pending',
			users: req.body.users,
		});

		try {
			const query = await newfriend.save();
			if (query) {
				res.status(200).json({ exists: true });
			} else {
				res.status(200).json({ exists: false });
			}
		} catch (e) {
			console.log(e.message);
		}
	})
);

router.put(
	'/update',
	asyncHandler(async (req, res) => {
		try {
			const query = await Friend.findById(req.body.id);

			//console.log(req.body);

			if (query) {
				query.status = req.body.status;
				query.senderStatus = req.body.senderStatus;
				query.receiverStatus = req.body.receiverStatus;
				query.save();

				res.status(200).json({ updated: true });
			} else {
				res.status(200).json({ updated: false });
			}
		} catch (e) {
			console.log(e.message);
		}
	})
);

router.post(
	'/delete',
	asyncHandler(async (req, res) => {
		try {
			const query = await Friend.findById(req.body.id);
			if (query) {
				query.remove();
				res.status(200).json({ deleted: true });
			} else {
				res.status(200).json({ deleted: false });
			}
		} catch (e) {
			console.log(e.message);
		}
	})
);

router.post(
	'/getfriendrequests',
	asyncHandler(async (req, res) => {
		try {
			const query = await Friend.find({
				receiver: req.body.receiver,
				status: 'pending',
			});
			if (query) {
				res.status(200).json({ doc: query, exists: true });
			} else {
				res.status(200).json({ exists: false });
			}
		} catch (e) {
			console.log(e.message);
		}
	})
);

router.post(
	'/getfriendlist',
	asyncHandler(async (req, res) => {
		try {
			const query = await Friend.find({
				users: { $in: [req.body.uid] },
				status: 'friends',
			});

			if (query.length > 0) {
				res.status(200).json({ doc: query, exists: true });
			} else {
				res.status(200).json({ exists: false });
			}
		} catch (e) {
			console.log(e.message);
		}
	})
);

export default router;
