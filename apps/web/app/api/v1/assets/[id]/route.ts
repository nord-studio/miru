import minio from "@/lib/minio";

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;

	const res = await minio.getObject("public", params.id).then(async (res) => {
		let buffer = Buffer.from("");

		for await (const chunk of res) {
			buffer = Buffer.concat([buffer, chunk]);
		}

		const stat = await minio.statObject("public", params.id);
		const type = stat.metaData["content-type"] || "image/png";

		return new Response(buffer, {
			headers: {
				"Content-Type": type,
				"Cache-Control": "public, max-age=300",
			}
		});
	}).catch(async (err) => {
		console.error(err);
		return new Response("Failed to find avatar", {
			status: 404
		});
	});

	return res;
}