export async function sendDiscordMessage(webhookUrl: string, content: string) {
	const res = await fetch(webhookUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: "Miru",
			avatar_url: "https://i.imgur.com/CD6oLPo.png",
			content: content
		})
	}).then(async (res) => {
		if (res.status === 204) {
			return {
				error: false,
				message: "Message sent successfully."
			}
		} else {
			return {
				error: true,
				message: await res.text()
			}
		}
	}).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to send message. Is the URL correct?" };
	})

	return res;
}

export async function sendSlackMessage(webhookUrl: string, json: { blocks: unknown[] }) {
	const res = await fetch(webhookUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(json)
	}).then(async (res) => {
		if (res.status === 200) {
			return {
				error: false,
				message: "Message sent successfully."
			}
		} else {
			return {
				error: true,
				message: await res.text()
			}
		}
	}).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to send message. Is the URL correct?" };
	})

	return res;
}