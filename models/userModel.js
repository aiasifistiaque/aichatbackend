import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		displayName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 255,
			unique: true,
			trim: true,
		},
		phoneNumber: {
			type: String,
			trim: true,
		},
		photoUrl: String,

		uid: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},

		username: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},

		notificationToken: {
			type: String,
		},

		onlineStatus: {
			type: String,
		},

		role: { type: String, default: 'user' },
		//password: { type: String, required: true, minlength: 5, maxlength: 1024 },
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model('User', userSchema);

export default User;
