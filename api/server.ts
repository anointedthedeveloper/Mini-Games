import server from "../src/server";

export const config = {
  runtime: "nodejs20.x",
};

export default async function (request: Request) {
  // Vercel Edge functions don't have the same (env, ctx) signature as Cloudflare,
  // but our server.ts fetch method accepts them as unknown.
  return server.fetch(request, {}, {});
}
