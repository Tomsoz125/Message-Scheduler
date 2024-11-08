import CryptoJS from "crypto-js";
import { Client } from "discord.js";
import { db } from "../../../db";
import getCommandLink from "../../utils/getCommandLink";
import { removeItem, sync } from "../../utils/messages";
import sendTokenMsg from "../../utils/sendTokenMsg";

export = async (client: Client) => {
	console.log(`${client.user?.username} is done loading and is now online!`);
	await sync();

	setInterval(async () => {
		const allSchedules = await db.scheduledMessage.findMany();
		for (const schedule of allSchedules) {
			if (schedule.time <= new Date()) {
				try {
					await db.scheduledMessage.delete({
						where: { id: schedule.id }
					});
					removeItem(schedule);
				} catch (e) {
					console.log(
						`Failed to delete scheduled message ${schedule.id} from the database, aborting message!`
					);

					const user = await client.users.fetch(schedule.userId);
					if (!user) {
						console.log(
							"Failed to fetch user " + schedule.userId + "!"
						);
						return;
					}
					try {
						await user.send(
							`Failed to delete scheduled message ${schedule.id} from the database, aborting message!`
						);
					} catch (e) {
						return;
					}
					return;
				}
				try {
					var token = await db.userToken.findUnique({
						where: { id: schedule.userId }
					});
				} catch (e) {
					console.log(
						`Failed to fetch user ${schedule.userId}'s token from the database, aborting message!`
					);

					const user = await client.users.fetch(schedule.userId);
					if (!user) {
						console.log(
							"Failed to fetch user " + schedule.userId + "!"
						);
						return;
					}
					try {
						await user.send(
							`Failed to fetch user ${schedule.userId}'s token from the database, aborting message!`
						);
					} catch (e) {
						return;
					}
					return;
				}
				if (!token) {
					console.log(
						`Failed to fetch user ${schedule.userId}'s token from the database, aborting message!`
					);

					const user = await client.users.fetch(schedule.userId);
					if (!user) {
						console.log(
							"Failed to fetch user " + schedule.userId + "!"
						);
						return;
					}
					try {
						await user.send(
							`You don't have a token linked to the bot! Aborting message!`
						);
					} catch (e) {
						return;
					}
					return;
				}
				const encryptedToken = token.token;
				const normalToken = CryptoJS.AES.decrypt(
					encryptedToken,
					process.env.ENCRYPTION_KEY!
				).toString(CryptoJS.enc.Utf8);

				const message = await sendTokenMsg(
					normalToken,
					schedule.message,
					schedule.channelId
				);
				if (message && message.status === 401) {
					const user = await client.users.fetch(schedule.userId);
					if (!user) {
						console.log(
							"Failed to fetch user " + schedule.userId + "!"
						);
						return;
					}
					try {
						await user.send(
							`The token you have provided to the bot is invalid! Please run ${await getCommandLink(
								{ command: "/token add", client }
							)} to link a valid one!`
						);
					} catch (e) {
						return;
					}

					try {
						await db.userToken.delete({
							where: { id: schedule.userId }
						});
					} catch (e) {
						return;
					}
				}
				const user = await client.users.fetch(schedule.userId);
				if (!user) {
					console.log(
						"Failed to fetch user " + schedule.userId + "!"
					);
					return;
				}

				try {
					await user.send(
						`I have sent the message with id \`${schedule.id}\` into <#${schedule.channelId}>!\nYou can view it here: https://discord.com/channels/${schedule.guildId}/${schedule.channelId}/${message.id}`
					);
				} catch (e) {
					return;
				}
				// TODO: Make channel groups, to allow people to schedule a message in multiple channels at the same time
				// TODO: Make a command to send a message in a group immediately instead of setting a schedule
				// TODO: Make a schedule list command
			}
		}
	}, 1000);
};
