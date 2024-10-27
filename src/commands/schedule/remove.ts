import {
	CacheType,
	Client,
	CommandInteraction,
	CommandInteractionOption,
	Interaction
} from "discord.js";
import { db } from "../../../db";
import getErrorEmbed from "../../utils/embeds/getErrorEmbed";
import { removeItem } from "../../utils/messages";
let name = "Cancel Schedule";

export = {
	deferred: true,
	callback: async (
		client: Client,
		interaction: CommandInteraction,
		subcommand: CommandInteractionOption<CacheType>
	) => {
		const user = interaction.user;
		let scheduleId = interaction.options.get("id", true).value as number;

		try {
			var schedule1 = await db.scheduledMessage.findUnique({
				where: { id: scheduleId }
			});
		} catch (e) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"Failed to cancel message, if you urgently do not want the message to post you should change your password as this will regenerate your account token!"
				)
			);
		}

		if (!schedule1) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"There is not a scheduled message with this ID, this could mean that the message has already been sent, or you entered the wrong ID. Please double check it."
				)
			);
		}
		try {
			var scheduled = await db.scheduledMessage.delete({
				where: { id: scheduleId }
			});

			removeItem(scheduled);
		} catch (e) {
			return await interaction.editReply(
				getErrorEmbed(
					interaction as Interaction,
					name,
					"Failed to cancel message, if you urgently do not want the message to post you should change your password as this will regenerate your account token!"
				)
			);
		}

		return await interaction.editReply(
			getErrorEmbed(
				interaction as Interaction,
				name,
				`Successfully deleted the schedule with id, \`${scheduleId}\`. It would have been sent <t:${Math.floor(
					scheduled.time.getTime() / 1000
				)}:R>!`
			)
		);
	}
};
