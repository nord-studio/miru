enum DiscordWebhookType {
	INCOMING = 1,
	CHANNEL_FOLLOWER = 2,
	APPLICATION = 3
}

/// https://discord.com/developers/docs/resources/user#user-object
interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	global_name: string | null;
	avatar: string | null;
}

/// https://discord.com/developers/docs/resources/guild#guild-object
interface DiscordPartialGuild {
	id: string;
	name: string;
}

export interface DiscordWebhook {
	id: string;
	type: DiscordWebhookType;
	guild_id?: string;
	channel_id?: string;
	user?: DiscordUser;
	name: string | null;
	avatar: string | null;
	token?: string;
	application_id: string | null;
	source_guild?: DiscordPartialGuild;
	url?: string;
}