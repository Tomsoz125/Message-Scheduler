import CryptoJS from "crypto-js";
import {
	CacheType,
	Client,
	CommandInteraction,
	CommandInteractionOption,
	Interaction
} from "discord.js";
import { db } from "../../../db";
import getErrorEmbed from "../../utils/embeds/getErrorEmbed";
import getSuccessEmbed from "../../utils/embeds/getSuccessEmbed";
import getCommandLink from "../../utils/getCommandLink";
let name = "Register Token";

export = {
	deferred: true,
	callback: async (
		client: Client,
		interaction: CommandInteraction,
		subcommand: CommandInteractionOption<CacheType>
	) => {
		const user = interaction.user;
		const token = interaction.options.get("token", true).value as string;
		try {
			var existingToken = await db.userToken.findUnique({
				where: { id: user.id }
			});
		} catch (e) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"Failed to connect to database! Please contact bot's developer for more assistance!"
				)
			);
		}

		if (existingToken) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					`You already have a token registered! Run ${await getCommandLink(
						{ client, command: "/token remove" }
					)} to remove it!`
				)
			);
		}

		const res = await fetch("https://discord.com/api/v9/quests/@me", {
			headers: { Authorization: token }
		});
		if (res.status === 401) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					`This is an invalid account token!`
				)
			);
		}

		const encrypted = CryptoJS.AES.encrypt(
			token,
			process.env.ENCRYPTION_KEY!
		).toString();

		try {
			await db.userToken.create({
				data: {
					id: user.id,
					token: encrypted
				}
			});
		} catch (e) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"Failed to connect to database! Please contact bot's developer for more assistance!"
				)
			);
		}

		return await interaction.editReply(
			getSuccessEmbed(
				interaction as Interaction,
				name,
				"Sucessfully linked your discord token! To delete it run " +
					(await getCommandLink({
						client,
						command: "/token remove"
					})) +
					"!"
			)
		);
	}
};
