import {
	CacheType,
	Client,
	CommandInteraction,
	CommandInteractionOption,
	Interaction,
	MessageCreateOptions
} from "discord.js";
import { db } from "../../../db";
import getErrorEmbed from "../../utils/embeds/getErrorEmbed";
import getSuccessEmbed from "../../utils/embeds/getSuccessEmbed";
let name = "Schedule Message";
const regex = /[0-9]+/i;

export = {
	deferred: true,
	callback: async (
		client: Client,
		interaction: CommandInteraction,
		subcommand: CommandInteractionOption<CacheType>
	) => {
		const user = interaction.user;
		let timestamp = interaction.options.get("time", true).value as string;
		const channelId = interaction.options.get("channel", true)
			.value! as string;
		if (!channelId) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"Please specify a channel"
				)
			);
		}

		if (timestamp.startsWith("<")) {
			const res = regex.exec(timestamp);
			console.log(res);
			if (!res || res.length < 1) {
				return await interaction.editReply(
					getErrorEmbed(
						interaction as Interaction,
						name,
						"Invalid timestamp format! Please use https://discordtimestamps.com/"
					)
				);
			}
			timestamp = res[0];
		}
		console.log(timestamp);
		try {
			var intTimestamp = parseInt(timestamp);
		} catch (e) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"Invalid timestamp format! Please use https://discordtimestamps.com/"
				)
			);
		}

		try {
			var dmMsg = await user.send(
				"Please send your full message here within 3 minutes!"
			);
		} catch (e) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"I can't send DMs to you!"
				)
			);
		}

		if (!user.dmChannel) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"I can't send DMs to you!"
				)
			);
		}

		await interaction.editReply(
			getSuccessEmbed(
				interaction as Interaction,
				name,
				`Please check your DMs!\nhttps://discord.com/channels/@me/${dmMsg.channel.id}/${dmMsg.id}`
			)
		);

		const msg = await user.dmChannel.awaitMessages({
			filter: (m) => m.author.id === user.id,
			time: 300_000,
			max: 1
		});

		if (msg.size < 1) {
			return await user.send(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"You didn't respond in time!"
				) as MessageCreateOptions
			);
		}

		try {
			var message = await db.scheduledMessage.create({
				data: {
					channelId: channelId,
					time: new Date(intTimestamp),
					userId: user.id,
					message: msg.first()!.content,
					guildId: interaction.guildId
				}
			});
		} catch (e) {
			console.error(e);
			return await user.send(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"Failed to connect to database! Please contact bot's developer for more assistance!"
				) as MessageCreateOptions
			);
		}

		return await user.send(
			getSuccessEmbed(
				interaction as Interaction,
				name,
				"Successfully scheduled message to be sent <t:" +
					timestamp +
					":R>! The ID of this schedule is `" +
					message.id +
					"`, you will need this to cancel the schedule!"
			) as MessageCreateOptions
		);
	}
};
