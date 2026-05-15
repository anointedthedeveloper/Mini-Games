import server from "../src/server";

// Use a standard Node.js handler. Vercel will auto-detect the runtime.
export const config = {
  memory: 1024,
};

export default async function handler(request: Request) {
  return server.fetch(request, {}, {});
}
