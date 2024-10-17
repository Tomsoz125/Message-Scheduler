import {
	ApplicationIntegrationType,
	InteractionContextType,
	SlashCommandBuilder
} from "discord.js";
import { CommandObject } from "typings";

export = {
	data: new SlashCommandBuilder()
		.setName("token")
		.setDescription(
			"Manages the token that your scheduled messages are linked to."
		)
		.setContexts(InteractionContextType.BotDM)
		.setIntegrationTypes(ApplicationIntegrationType.UserInstall)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("add")
				.setDescription("Adds a discord token")
				.addStringOption((o) =>
					o
						.setName("token")
						.setDescription("The token you wish to set!")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription(
					"Permanently deletes your discord token from the database"
				)
		),
	botPermissions: [],
	enabled: true,
	deleted: false
} as CommandObject;
