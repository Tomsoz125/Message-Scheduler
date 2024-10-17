import { Client } from "discord.js";

export = async ({ client, command }: { client: Client; command: string }) => {
	const commandName =
		command.split(" ").length > 0
			? command.split(" ")[0].slice(1)
			: command.slice(1);
	if (!client.application) return command;
	const commands = await client.application.commands.fetch();
	const cmds = commands.filter((cmd) => cmd.name === commandName);
	return cmds.size > 0 ? `<${command}:${cmds.at(0)!.id}>` : command;
};
