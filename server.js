import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js';
import cors from 'cors';
import userRoute from './routes/userRoute.js';
import friendsRoute from './routes/friendsRoute.js';
import latestChatsRoute from './routes/latestChatsRoute.js';
import chatRoute from './routes/chatRoute.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Chat from './models/chatModel.js';
import chatStreamWatch from './controllers/streams/chatStream.js';
import activeChatsSocket from './socket/activeChatsSocket.js';
import LatestChat from './models/latestChatModel.js';
import activeChatsStreamWatch from './controllers/streams/activeChatsStream.js';

dotenv.config();
connectDB();

const app = express();

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

	socket.emit('connected', socket.id);

	const chatRoomId = socket.handshake.query['chatRoomId'];
	console.log('num of connections', io.engine.clientsCount);

	socket.on('join chat room', data => {
		socket.join(data.roomId);
		console.log(`${socket.id} joined room ${data.roomId}`);
	});

	socket.on('leave chat room', data => {
		socket.leave(data.roomId);
		console.log(`${socket.id} joined left ${data.roomId}`);
	});

	socket.on('join home room', data => {
		socket.join(data.roomId);
		console.log(`${socket.id} joined room ${data.roomId}`);
	});

	socket.on('leave home room', data => {
		socket.leave(data.roomId);
		console.log(`${socket.id} joined left ${data.roomId}`);
	});

	socket.on('disconnect', () => {
		console.log(`Disconnected: ${socket.id}`);
	});
});

const port = process.env.PORT || 5001;

httpServer.listen(port, console.log(`Server socket running on port ${port}`));
