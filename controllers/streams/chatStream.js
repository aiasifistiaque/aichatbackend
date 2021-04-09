//
import Chat from '../../models/chatModel.js';
import { io } from '../../server.js';
import updateLatestChats from '../latestChatsController.js';

const chatStream = doc => {
	console.log('changes have been made');
	if (doc.operationType == 'insert') {
		const users = doc.fullDocument.people;
		const sortedUsers = users.sort();
		const roomId = sortedUsers[0] + sortedUsers[1];

		io.of('/users').to(roomId).emit('newChat', doc.fullDocument);
		//socket.emit('docChange', doc.fullDocument);
		updateLatestChats(doc.fullDocument);
	} else if (doc.operationType == 'delete') {
		//socket.emit('docDelete', doc.documentKey);
	}
};

export default chatStream;
