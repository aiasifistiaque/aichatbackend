import { io } from '../../server.js';

const friendRequestStream = doc => {
	console.log('friend req stream started');
	if (doc.operationType == 'insert') {
		io.of('/users')
			.to(doc.fullDocument.receiver)
			.emit('newFriendRequest', doc.fullDocument);
	} else if (doc.operationType == 'delete') {
		io.of('/users')
			.to(doc.fullDocument.receiver)
			.emit('canceledFriendRequest', doc.fullDocument);
	} else if (doc.operationType == 'update') {
		const status = doc.fullDocument.status;
		if (status == 'friends') {
			io.of('/users')
				.to(doc.fullDocument.sender)
				.emit('newFriend', doc.fullDocument);
			io.of('/users')
				.to(doc.fullDocument.receiver)
				.emit('newFriend', doc.fullDocument);
		}
	}
};

export default friendRequestStream;
