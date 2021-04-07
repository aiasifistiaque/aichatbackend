import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema(
	{
		receiver: {
			type: String,
		},
		receiverStatus: {
			type: String,
		},
		sender: {
			type: String,
		},
		senderStatus: {
			type: String,
		},
		status: String,
		users: [],
	},
	{
		timestamps: true,
	}
);

const Friend = mongoose.model('Friend', friendSchema);

export default Friend;
