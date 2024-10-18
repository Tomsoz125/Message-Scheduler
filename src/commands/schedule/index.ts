import {
	ApplicationIntegrationType,
	ChannelType,
	SlashCommandBuilder
} from "discord.js";
import { CommandObject } from "typings";

export = {
	data: new SlashCommandBuilder()
		.setName("schedule")
		.setDescription("Manages the current message schedule.")
		.setIntegrationTypes(ApplicationIntegrationType.UserInstall)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("add")
				.setDescription("Adds a scheduled message")
				.addStringOption((o) =>
					o
						.setName("time")
						.setDescription(
							"The discord timestamp to send the message at!"
						)
						.setRequired(true)
				)
				.addChannelOption((o) =>
					o
						.setName("channel")
						.setDescription(
							"The channel to send it in, default is current channel!"
						)
						.addChannelTypes(
							ChannelType.GuildText,
							ChannelType.GuildAnnouncement
						)
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription("Removes a scheduled message")
				.addIntegerOption((o) =>
					o
						.setName("id")
						.setDescription(
							"The id of the scheduled message! (Found in dms with the bot)"
						)
						.setRequired(true)
				)
		),
	botPermissions: [],
	enabled: true,
	deleted: false
} as CommandObject;
