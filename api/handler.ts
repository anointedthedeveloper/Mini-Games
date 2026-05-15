import server from "../src/server";

// Explicitly force Node.js runtime to support modules like tailwind-merge
// that are not compatible with the restricted Edge environment.
export const config = {
  runtime: "nodejs20.x",
};

export default async function handler(request: Request) {
  return server.fetch(request, {}, {});
}
