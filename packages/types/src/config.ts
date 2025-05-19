export type MiruConfig = {
	email: {
		enabled: boolean;
		verification: boolean;
	},
	incidents: {
		auto: {
			enabled: boolean;
		}
	},
	storage: {
		max_size: number;
	}
}