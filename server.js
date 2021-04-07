import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js';
import cors from 'cors';
import userRoute from './routes/userRoute.js';
import friendsRoute from './routes/friendsRoute.js';
import chatRoute from './routes/chatRoute.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Chat from './models/chatModel.js';

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

const chatNamespace = io.of('/chats');

const chatStream = Chat.watch();

//const chatNamespace = io.of('/chats');
chatStream.on('change', doc => {
	console.log('changes have been made');
	if (doc.operationType == 'insert') {
		const users = doc.fullDocument.people;
		const sortedUsers = users.sort();
		const roomId = sortedUsers[0] + sortedUsers[1];

		io.of('/chats').to(roomId).emit('newChat', doc.fullDocument);
		//socket.emit('docChange', doc.fullDocument);
	} else if (doc.operationType == 'delete') {
		//socket.emit('docDelete', doc.documentKey);
	}
});

chatNamespace.on('connection', socket => {
	console.log(`a connection was estublished ${socket.id}`);
	const chatRoomId = socket.handshake.query['chatRoomId'];
	console.log('roomid', chatRoomId);

	console.log('i am connected');

	//console.log('connected clients', io.sockets.clients().toString());

	socket.join(chatRoomId);
	//socket.disconnect();

	console.log('num of connections', io.engine.clientsCount);

	chatNamespace.on('disconnect', () => {
		socket.leave(chatRoomId);
		console.log(`namespace disconnecting: ${socket.id}`);
	});

	socket.on('disconnect', () => {
		socket.leave(chatRoomId);
		console.log(`Disconnected: ${socket.id}`);
		//chatStream.close();
	});
});

const port = process.env.PORT || 5001;

httpServer.listen(port, console.log(`Server socket running on port ${port}`));
