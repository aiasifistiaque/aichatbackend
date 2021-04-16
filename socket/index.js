//

import { io } from '../server.js';
import Chat from '../models/chatModel.js';

export const onSocketConnection = socket => {
	console.log(`a connection was estublished ${socket.id}`);

	console.log(socket.handshake.query);

	const userid = socket.handshake.query.uid;
	socket.join(userid);

	socket.emit('connected', socket.id);

	//const chatRoomId = socket.handshake.query['chatRoomId'];
	console.log('num of connections', io.engine.clientsCount);

	socket.join(`activechats${userid}`);
	console.log(`${socket.id} joined room activechats${userid}`);

	socket.on('join chat room', (data, callback) => {
		socket.join(data.roomId);
		console.log(`${socket.id} joined room ${data.roomId}`);
		callback({ status: 'ok' });
	});

	socket.on('send a new message', async (data, callback) => {
		const addChat = new Chat({
			message: data.message,
			receiver: data.receiver,
			people: [data.sender, data.receiver],
			sender: data.sender,
			status: 'sent',
			msgStatus: 'visible',
		});
		try {
			const chatAdded = await addChat.save();
			callback({ status: 'ok' });
		} catch (e) {
			callback({ status: 'error' });
			console.log(e);
		}
	});

	socket.on('leave chat room', (data, callback) => {
		socket.leave(data.roomId);
		console.log(`${socket.id} joined left ${data.roomId}`);
		callback({ status: 'ok' });
	});

	socket.on('join home room', (data, callback) => {
		// socket.join(data.roomId);
		// socket.join(data.uid);
		// console.log(`${socket.id} joined room ${data.roomId}`);
		callback({ status: 'ok' });
	});

	socket.on('leave home room', (data, callback) => {
		// socket.leave(data.roomId);
		// socket.leave(data.uid);
		// console.log(`${socket.id} joined left ${data.roomId}`);
		callback({ status: 'ok' });
	});

	//room for friend requests
	socket.on('join request room', (data, callback) => {
		socket.join(`friendReq${data.roomId}`);
		callback({ status: 'ok' });
	});

	socket.on('leave request room', (data, callback) => {
		socket.leave(`friendReq${data.roomId}`);
		callback({ status: 'ok' });
	});

	//room for friend list
	socket.on('join friendlist room', (data, callback) => {
		socket.join(`friendlist${data.roomId}`);
		callback({ status: 'ok' });
	});

	socket.on('leave friendlist room', (data, callback) => {
		socket.leave(`friendlist${data.roomId}`);
		callback({ status: 'ok' });
	});

	socket.on('disconnect', () => {
		socket.leave(`activechats${userid}`);
		console.log(`${socket.id} left room activechats${userid}`);
		console.log(`Disconnected: ${socket.id}`);
		socket.leave(userid);
	});
};
