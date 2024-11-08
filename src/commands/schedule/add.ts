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
import getCommandLink from "../../utils/getCommandLink";
import { addItem } from "../../utils/messages";
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
		const token = await db.userToken.findUnique({ where: { id: user.id } });
		if (!token) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					`You don't have a token linked to your account! Run ${await getCommandLink(
						{ client, command: "/token add" }
					)} to link one!`
				)
			);
		}
		let timestamp = interaction.options.get("time", true).value as number;
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
					time: new Date(timestamp * 1000),
					userId: user.id,
					message: msg.first()!.content,
					guildId: interaction.guildId
				}
			});

			addItem(message);
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
