import { io } from '../../server.js';
import Friend from '../../models/friendModel.js';
import User from '../../models/userModel.js';
import { sendMessage } from '../../expo/index.js';

const friendRequestStream = async doc => {
	console.log('friend req stream started');
	if (doc.operationType == 'insert') {
		console.log(doc);
		io.of('/users')
			.to(`friendReq${doc.fullDocument.receiver}`)
			.emit('newFriendRequest', doc.fullDocument);

		const foundUser = await User.findOne({ uid: doc.fullDocument.receiver });
		if (foundUser) {
			let tickets = await sendMessage([
				{
					to: foundUser.notificationToken,
					sound: 'default',
					body: 'You have a new friend request',
				},
			]);
			let receiptIds = getReceiptIds(tickets);
			await obtainReceipts(receiptIds);
		}
	} else if (doc.operationType == 'delete') {
		console.log(doc);
	} else if (doc.operationType == 'update') {
		console.log(doc);

		Friend.findOne(doc.documentKey)
			.then(res => {
				if (res.status == 'friends') {
					io.of('/users')
						.to(`friendlist${doc.data.sender}`)
						.emit('newFriend', res.data);
					io.of('/users')
						.to(`friendlist${doc.data.receiver}`)
						.emit('newFriend', res.data);
				}
			})
			.catch(e => console.log(e));
	}
};

export default friendRequestStream;
