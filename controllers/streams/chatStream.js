//
import { io } from '../../server.js';
import updateLatestChats from '../latestChatsController.js';
import User from '../../models/userModel.js';
import {
	sendMessage,
	getReceiptIds,
	obtainReceipts,
} from '../../expo/index.js';

const chatStream = async doc => {
	console.log('changes have been made');
	if (doc.operationType == 'insert') {
		const users = doc.fullDocument.people;
		const sortedUsers = users.sort();
		const roomId = sortedUsers[0] + sortedUsers[1];

		io.of('/users').to(roomId).emit('newChat', doc.fullDocument);

		const receiver = doc.fullDocument.receiver;
		const sender = doc.fullDocument.sender;
		const senderUser = await User.findOne({ uid: sender });
		const user = await User.findOne({ uid: receiver });

		updateLatestChats(doc.fullDocument);

		if (user) {
			//console.log('user has been detected', user);
			if (!user.notificationToken || user.notificationToken == null) {
			} else {
				let tickets = await sendMessage([
					{
						to: user.notificationToken,
						sound: 'default',
						title: senderUser.username,
						body: doc.fullDocument.message,
						data: { doc: doc.fullDocument },
					},
				]);
				let receiptIds = getReceiptIds(tickets);
				await obtainReceipts(receiptIds);
			}
		}

		//socket.emit('docChange', doc.fullDocument);
	} else if (doc.operationType == 'delete') {
		//socket.emit('docDelete', doc.documentKey);
	}
};

export default chatStream;
