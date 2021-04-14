import express from 'express';
import asyncHandler from 'express-async-handler';

import User from '../models/userModel.js';

const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({ name: 'Name' });
});

router.post(
	'/',
	asyncHandler(async (req, res) => {
		const newUser = new User({
			displayName: req.body.displayName,
			email: req.body.email,
			photoUrl: req.body.photoUrl || null,
			uid: req.body.uid,
			username: req.body.username,
		});

		try {
			const createUser = await newUser.save();
			res.status(200).json(createUser);
		} catch (e) {
			res.status(500).json({ msg: e });
		}
	})
);

router.post(
	'/finduser',
	asyncHandler(async (req, res) => {
		const user = await User.findOne({ username: req.body.username });
		if (user) res.status(200).json({ exists: true });
		else res.status(200).json({ exists: false });
	})
);

router.post(
	'/finduserbyid',
	asyncHandler(async (req, res) => {
		const user = await User.findOne({ uid: req.body.uid });
		if (user) res.status(200).json({ exists: true });
		else res.status(200).json({ exists: false });
	})
);

router.post(
	'/getselfinfo',
	asyncHandler(async (req, res) => {
		const user = await User.findOne({ uid: req.body.uid });
		if (user) res.status(200).json(user);
		else res.status(200).json({ exists: false });
	})
);

router.post(
	'/searchbyusername',
	asyncHandler(async (req, res) => {
		const user = await User.findOne({ username: req.body.username });
		if (user) res.status(200).json({ user: user, exists: true });
		else res.status(200).json({ exists: false });
	})
);

router.post(
	'/searchbyid',
	asyncHandler(async (req, res) => {
		const user = await User.findOne({ uid: req.body.uid });
		if (user) res.status(200).json({ user: user, exists: true });
		else res.status(200).json({ exists: false });
	})
);

router.put(
	'/addnotificationtoken',
	asyncHandler(async (req, res) => {
		const user = await User.findOne({ uid: req.body.uid });
		if (user) {
			user.notificationToken = req.body.token;
			const query = await user.save();
			res.status(200).json({ user: query, exists: true });
		} else res.status(200).json({ exists: false });
	})
);

router.post('/search', async (req, res) => {
	let query = [];
	if (req.body.searchString.length < 1)
		res.status(200).json({ users: [], exists: false });
	try {
		if (req.body.searchString.length > 0) {
			query = await User.find()
				.where({
					$or: [
						{
							username: { $regex: req.body.searchString, $options: 'i' },
						},
						{
							displayName: { $regex: req.body.searchString, $options: 'i' },
						},
					],
				})
				.limit(5);
		}
		if (query.length > 0) {
			res.status(200).json({ users: query, exists: true });
		} else {
			res.status(200).json({ users: [], exists: false });
		}
	} catch (e) {
		console.log(e);
		res.status(200).json({ users: [], exists: false, error: true });
	}
});

export default router;
