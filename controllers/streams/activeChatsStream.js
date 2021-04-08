import { io } from '../../server.js';

const activeChatsStream = doc => {
	console.log('changes have been made');
	if (doc.operationType == 'insert') {
		const roomId = doc.fullDocument.user;
		io.of('/activechats').to(roomId).emit('addnewchat', doc.fullDocument);
	} else if (doc.operationType == 'delete') {
		//socket.emit('docDelete', doc.documentKey);
	}
};

export default activeChatsStream;
