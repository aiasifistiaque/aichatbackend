//
import Chat from '../../models/chatModel.js';
import { io, messages } from '../../server.js';
import updateLatestChats from '../latestChatsController.js';
import User from '../../models/userModel.js';

const chatStream = async doc => {
	console.log('changes have been made');
	if (doc.operationType == 'insert') {
		const users = doc.fullDocument.people;
		const sortedUsers = users.sort();
		const roomId = sortedUsers[0] + sortedUsers[1];

		io.of('/users').to(roomId).emit('newChat', doc.fullDocument);

		const receiver = doc.fullDocument.receiver;
		const user = await User.findOne({ uid: receiver });

		if (user) {
			//console.log('user has been detected', user);
			messages.push({
				to: user.notificationToken,
				sound: 'default',
				body: doc.fullDocument.message,
				data: { doc: doc.fullDocument },
			});
			console.log(messages);
		}

		//socket.emit('docChange', doc.fullDocument);
		updateLatestChats(doc.fullDocument);
	} else if (doc.operationType == 'delete') {
		//socket.emit('docDelete', doc.documentKey);
	}
};

export default chatStream;
