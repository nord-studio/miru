import { auth } from "@/lib/auth"
import { getConfig } from "@/lib/config"

export default async function ConfigPage() {
	const { config } = await getConfig();

	return (
		<code>
			{JSON.stringify(config, null, 2)}
		</code>
	)
}