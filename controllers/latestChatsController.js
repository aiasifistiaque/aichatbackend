///
import LatestChat from '../models/latestChatModel.js';
import { io } from '../server.js';

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
		console.log('update chat to sender');
		findSender.message = doc.message;
		findSender.status = doc.status;
		findSender.msgStatus = doc.msgStatus;
		findSender.isSender = true;
		io.of('/users').to(sender).emit('updateactivechats', findSender);
		findSender.save();
	} else {
		console.log('add chat to sender');

		const postSender = new LatestChat({
			user: doc.sender,
			friend: doc.receiver,
			isSender: true,
			message: doc.message,
			status: doc.status,
			msgStatus: doc.msgStatus,
		});
		io.of('/users').to(sender).emit('addactivechats', postSender);

		postSender.save();
	}

	if (findReceiver) {
		console.log('update chat to receiver');

		findReceiver.message = doc.message;
		findReceiver.status = doc.status;
		findReceiver.msgStatus = doc.msgStatus;
		findReceiver.isSender = false;

		io.of('/users').to(receiver).emit('updateactivechats', findReceiver);

		findReceiver.save();
	} else {
		console.log('add chat to receiver');

		const postReceiver = new LatestChat({
			user: doc.receiver,
			friend: doc.sender,
			isSender: false,
			message: doc.message,
			status: doc.status,
			msgStatus: doc.msgStatus,
		});
		io.of('/users').to(receiver).emit('addactivechats', postReceiver);

		postReceiver.save();
	}
};

export default updateLatestChats;
