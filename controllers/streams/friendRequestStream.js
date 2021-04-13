import { io } from '../../server.js';
import Friend from '../../models/friendModel.js';

const friendRequestStream = doc => {
	console.log('friend req stream started');
	if (doc.operationType == 'insert') {
		console.log(doc);
		io.of('/users')
			.to(`friendReq${doc.fullDocument.receiver}`)
			.emit('newFriendRequest', doc.fullDocument);
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
