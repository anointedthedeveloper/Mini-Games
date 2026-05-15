export const config = {
  runtime: "nodejs20.x",
};

function createRequest(req: any) {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url, `http://${host}`);
  const headers = new Headers();

  for (const [name, value] of Object.entries(req.headers || {})) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => item && headers.append(name, item));
    } else if (typeof value === "string") {
      headers.set(name, value);
    }
  }

  return new Request(url.toString(), {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
  });
}

async function sendResponse(res: any, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });

  const body = response.body ? Buffer.from(await response.arrayBuffer()) : null;
  if (body) {
    res.end(body);
  } else {
    res.end();
  }
}

export default async function handler(req: any, res: any) {
  try {
    const entry = await import("@tanstack/react-start/server-entry");
    const serverEntry = entry.default ?? entry;
    const request = createRequest(req);
    const response = await serverEntry.fetch(request);
    await sendResponse(res, response);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
}
