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
import friendRequestWatch from './controllers/streams/friendRequestStream.js';
import { onSocketConnection } from './socket/index.js';

dotenv.config();
connectDB();

const app = express();

export const expo = new Expo();
export let messages = [];

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

io.of('/users').on('connection', onSocketConnection);

const port = process.env.PORT || 5001;

httpServer.listen(port, console.log(`Server socket running on port ${port}`));
