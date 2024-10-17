import {
	ColorResolvable,
	EmbedBuilder,
	Interaction,
	InteractionReplyOptions
} from "discord.js";
import { colours } from "../../../config.json";

export = (
	interaction: Interaction,
	name: string,
	message: string
): InteractionReplyOptions => {
	const embed = new EmbedBuilder()
		.setAuthor({
			name,
			iconURL: interaction.client.user.displayAvatarURL()
		})
		.setDescription(message)
		.setColor(colours.error as ColorResolvable)
		.setTimestamp()
		.setFooter({
			// @ts-ignore
			text: `${interaction.user!.displayName} • ${name}`,
			iconURL: interaction.user!.displayAvatarURL() as string
		});

	return { embeds: [embed], ephemeral: true };
};
