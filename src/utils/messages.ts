import { ScheduledMessage } from "@prisma/client";
import { db } from "../../db";

let messages: ScheduledMessage[] = [];

export const sync = async () => {
	const msgs = await db.scheduledMessage.findMany();
	messages = msgs;
	console.log(
		`Successfully synced cache with the database and added ${msgs.length} items.`
	);
};
export const getArray = () => messages;
export const addItem = (msg: ScheduledMessage) => messages.push(msg);
export const updateItem = (index: number, newItem: ScheduledMessage) => {
	if (index >= 0 && index < messages.length) {
		messages[index] = newItem;
	}
};
export const removeItem = (msg: ScheduledMessage) => {
	let newArray = [];
	for (const m of messages) {
		if (m.id !== msg.id) newArray.push(m);
	}

	messages = newArray;
};
export const clearArray = () => (messages = []);
