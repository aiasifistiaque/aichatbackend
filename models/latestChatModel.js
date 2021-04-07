import mongoose from 'mongoose';

const latestChatSchema = new mongoose.Schema(
	{
		user: {
			type: String,
			required: true,
			trim: true,
		},
		friend: {
			type: String,
			required: true,
			trim: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
		},
		msgStatus: {
			type: String,
		},
		status: {
			type: String,
		},
		isSender: Boolean,
	},
	{
		timestamps: true,
	}
);

const LatestChat = mongoose.model('Latestchat', latestChatSchema);

export default LatestChat;
