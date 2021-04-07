import mongoose from 'mongoose';

const latestChatSchema = new mongoose.Schema(
	{
		displayName: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

const LatestChat = mongoose.model('LatestChat', latestChatSchema);

export default LatestChat;
