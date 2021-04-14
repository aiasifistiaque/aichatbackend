import { expo, messages } from '../server.js';

export const sendMessage = async () => {
	let chunks = expo.chunkPushNotifications(messages);
	let tickets = [];

	// Send the chunks to the Expo push notification service. There are
	// different strategies you could use. A simple one is to send one chunk at a
	// time, which nicely spreads the load out over time:
	for (let chunk of chunks) {
		try {
			let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
			console.log(ticketChunk);
			tickets.push(...ticketChunk);
			messages = [];
			// NOTE: If a ticket contains an error code in ticket.details.error, you
			// must handle it appropriately. The error codes are listed in the Expo
			// documentation:
			// https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
		} catch (error) {
			console.error(error);
		}
	}
	return tickets;
};

export const getReceiptIds = tickets => {
	let receiptIds = [];
	for (let ticket of tickets) {
		// NOTE: Not all tickets have IDs; for example, tickets for notifications
		// that could not be enqueued will have error information and no receipt ID.
		if (ticket.id) {
			receiptIds.push(ticket.id);
		}
	}
	return receiptIds;
};

export const obtainReceipts = async receiptIds => {
	let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
	// Like sending notifications, there are different strategies you could use
	// to retrieve batches of receipts from the Expo service.
	for (let chunk of receiptIdChunks) {
		try {
			let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
			console.log('receipts');
			console.log(receipts);
			// receipts may only be one object
			if (!Array.isArray(receipts)) {
				let receipt = receipts;
				if (receipt.status === 'ok') {
					continue;
				} else if (receipt.status === 'error') {
					console.error(
						`There was an error sending a notification: ${receipt.message}`
					);
					if (receipt.details && receipt.details.error) {
						// The error codes are listed in the Expo documentation:
						// https://docs.expo.io/versions/latest/guides/push-notifications#response-format
						// You must handle the errors appropriately.
						console.error(`The error code is ${receipt.details.error}`);
					}
				}
				return;
			}
			// The receipts specify whether Apple or Google successfully received the
			// notification and information about an error, if one occurred.
			for (let receipt of receipts) {
				if (receipt.status === 'ok') {
					continue;
				} else if (receipt.status === 'error') {
					console.error(
						`There was an error sending a notification: ${receipt.message}`
					);
					if (receipt.details && receipt.details.error) {
						// The error codes are listed in the Expo documentation:
						// https://docs.expo.io/versions/latest/guides/push-notifications#response-format
						// You must handle the errors appropriately.
						console.error(`The error code is ${receipt.details.error}`);
					}
				}
			}
		} catch (error) {
			console.error(error);
		}
	}
};
