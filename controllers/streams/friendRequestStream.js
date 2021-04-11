import { io } from '../../server.js';
import Friend from '../../models/friendModel.js';

const friendRequestStream = doc => {
	console.log('friend req stream started');
	if (doc.operationType == 'insert') {
		console.log(doc);
		io.of('/users')
			.to(doc.fullDocument.receiver)
			.emit('newFriendRequest', doc.fullDocument);
	} else if (doc.operationType == 'delete') {
		console.log(doc);
		// io.of('/users')
		// 	.to(doc.fullDocument.receiver)
		// 	.emit('canceledFriendRequest', doc.fullDocument);
	} else if (doc.operationType == 'update') {
		console.log(doc);

		Friend.findOne(doc.documentKey)
			.then(res => {
				console.log(res);
				io.of('/users').to(doc.sender).emit('newFriend', doc.fullDocument);
				io.of('/users').to(doc.receiver).emit('newFriend', doc.fullDocument);
			})
			.catch(e => console.log(e));
	}
};

export default friendRequestStream;
