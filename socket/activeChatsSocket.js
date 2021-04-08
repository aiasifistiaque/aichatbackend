//
import { io } from '../server.js';

const activeChatsSocket = socket => {
	console.log(`a connection was estublished ${socket.id}`);

	const chatRoomId = socket.handshake.query['chatRoomId'];

	socket.join(chatRoomId);
	console.log('num of connections to active socket', io.engine.clientsCount);

	socket.on('disconnect', () => {
		socket.leave(chatRoomId);
		console.log(`Disconnected: ${socket.id}`);
	});
};

export default activeChatsSocket;
