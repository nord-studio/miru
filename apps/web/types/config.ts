export type MiruConfig = {
	email: {
		enabled: boolean;
		verification: boolean;
	},
	incidents: {
		auto: {
			enabled: boolean;
			pings_threshold: number;
		}
	},
	storage: {
		max_size: number;
	},
	workspace: {
		creation: boolean;
	},
	users: {
		/// If enabled, any registered user who isn't in any workspaces will be deleted
		delete_on_empty: boolean;
	}
}