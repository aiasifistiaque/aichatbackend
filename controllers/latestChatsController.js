///
import LatestChat from '../models/latestChatModel.js';

const updateLatestChats = async doc => {
	const sender = doc.sender;
	const receiver = doc.receiver;

	const findSender = await LatestChat.findOne({
		user: sender,
		friend: receiver,
	});
	const findReceiver = await LatestChat.findOne({
		user: receiver,
		friend: sender,
	});

	if (findSender) {
		findSender.message = doc.message;
		findSender.status = doc.status;
		findSender.msgStatus = doc.msgStatus;
		findSender.isSender = true;
		findSender.save();
	} else {
		const postSender = new LatestChat({
			user: doc.sender,
			friend: doc.receiver,
			isSender: true,
			message: doc.message,
			status: doc.status,
			msgStatus: doc.msgStatus,
		});
		postSender.save();
	}

	if (findReceiver) {
		findReceiver.message = doc.message;
		findReceiver.status = doc.status;
		findReceiver.msgStatus = doc.msgStatus;
		findReceiver.isSender = false;
		findReceiver.save();
	} else {
		const postReceiver = new LatestChat({
			user: doc.receiver,
			friend: doc.sender,
			isSender: false,
			message: doc.message,
			status: doc.status,
			msgStatus: doc.msgStatus,
		});
		postReceiver.save();
	}
};

export default updateLatestChats;
