import server from "../dist/server/server.js";

// We've switched to the Node.js runtime (by removing the Edge config)
// to support dependencies like tailwind-merge and tanstack/router.
export default async (request) => {
  return server.fetch(request);
};
