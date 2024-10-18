import { Client, IntentsBitField, Partials } from "discord.js";
import { config } from "../config";
import eventHandler from "./handlers/eventHandler";

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.DirectMessages
	],
	partials: [Partials.Channel]
});

eventHandler(client);

client.login(config.BOT_TOKEN);
