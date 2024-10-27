const endpoint = "https://discord.com/api/v9/channels/{channelId}/messages";

export = async (token: string, message: string, channel: string) => {
	const response = await fetch(endpoint.replace("{channelId}", channel), {
		method: "post",
		headers: { Authorization: token, "Content-Type": "application/json" },
		// @ts-ignore
		body: JSON.stringify({ content: message })
	});
	if (response.status === 401) {
		return { status: 401 };
	}

	return response.json();
};
