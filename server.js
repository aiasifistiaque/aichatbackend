import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js';
import cors from 'cors';
import { Expo } from 'expo-server-sdk';
import userRoute from './routes/userRoute.js';
import friendsRoute from './routes/friendsRoute.js';
import latestChatsRoute from './routes/latestChatsRoute.js';
import chatRoute from './routes/chatRoute.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Chat from './models/chatModel.js';
import Friend from './models/friendModel.js';
import chatStreamWatch from './controllers/streams/chatStream.js';
import activeChatsSocket from './socket/activeChatsSocket.js';
import LatestChat from './models/latestChatModel.js';
import activeChatsStreamWatch from './controllers/streams/activeChatsStream.js';
import friendRequestWatch from './controllers/streams/friendRequestStream.js';

dotenv.config();
connectDB();

const app = express();

let expo = new Expo();

export let messages = [];

let chunks = expo.chunkPushNotifications(messages);
let tickets = [];
(async () => {
	// Send the chunks to the Expo push notification service. There are
	// different strategies you could use. A simple one is to send one chunk at a
	// time, which nicely spreads the load out over time:
	for (let chunk of chunks) {
		try {
			let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
			console.log(ticketChunk);
			tickets.push(...ticketChunk);
			// NOTE: If a ticket contains an error code in ticket.details.error, you
			// must handle it appropriately. The error codes are listed in the Expo
			// documentation:
			// https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
		} catch (error) {
			console.error(error);
		}
	}
})();

const httpServer = createServer(app);
export const io = new Server(httpServer, {
	// ...
});

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors());

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	next();
});

//api routes
app.use('/api/users', userRoute);
app.use('/api/friends', friendsRoute);
app.use('/api/chats', chatRoute);
app.use('/api/latestchats', latestChatsRoute);

const chatStream = Chat.watch();
chatStream.on('change', chatStreamWatch);

const friendReqStream = Friend.watch();
friendReqStream.on('change', friendRequestWatch);

const activeChatStream = LatestChat.watch();
//activeChatStream.on('change', activeChatsStreamWatch);

io.of('/activechats').on('connection', activeChatsSocket);

io.of('/chats').on('connection', socket => {
	console.log(`a connection was estublished ${socket.id}`);
	const chatRoomId = socket.handshake.query['chatRoomId'];

	socket.join(chatRoomId);
	console.log('num of connections', io.engine.clientsCount);

	socket.on('disconnect', () => {
		socket.leave(chatRoomId);
		console.log(`Disconnected: ${socket.id}`);
	});
});

io.of('/users').on('connection', socket => {
	console.log(`a connection was estublished ${socket.id}`);

	const userid = socket.handshake.query.id;
	socket.join(userid);

	socket.emit('connected', socket.id);

	//const chatRoomId = socket.handshake.query['chatRoomId'];
	console.log('num of connections', io.engine.clientsCount);

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
		socket.join(data.roomId);
		socket.join(data.uid);
		console.log(`${socket.id} joined room ${data.roomId}`);
		callback({ status: 'ok' });
	});

	socket.on('leave home room', (data, callback) => {
		socket.leave(data.roomId);
		socket.leave(data.uid);
		console.log(`${socket.id} joined left ${data.roomId}`);
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
		console.log(`Disconnected: ${socket.id}`);
		socket.leave(userid);
	});
});

const port = process.env.PORT || 5001;

httpServer.listen(port, console.log(`Server socket running on port ${port}`));
