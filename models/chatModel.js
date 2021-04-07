import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
	{
		message: {
			type: String,
			required: true,
			trim: true,
		},
		people: [],
		sender: { type: String, required: true },
		receiver: { type: String },

		status: String,
		msgStatus: String,
	},
	{
		timestamps: true,
	}
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
