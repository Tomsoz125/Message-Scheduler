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
let name = "Review Config";

export = {
	deferred: true,
	callback: async (
		client: Client,
		interaction: CommandInteraction,
		subcommand: CommandInteractionOption<CacheType>
	) => {
		const user = interaction.user;

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

		if (!existingToken) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					`You don't have a token registered! Run ${await getCommandLink(
						{ client, command: "/token add" }
					)} to add one!`
				)
			);
		}

		try {
			await db.userToken.delete({ where: { id: user.id } });
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
				"Sucessfully deleted your discord token! To link it again run " +
					(await getCommandLink({
						client,
						command: "/token add"
					})) +
					"!"
			)
		);
	}
};
