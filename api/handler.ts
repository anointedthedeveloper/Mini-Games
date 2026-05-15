import server from "../src/server";

// Use a standard Node.js handler. Vercel will auto-detect the runtime.
export const config = {
  memory: 1024,
};

export default async function handler(request: Request) {
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return new Response(
      JSON.stringify({ 
        error: "Configuration Error", 
        message: "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the Vercel Dashboard." 
      }), 
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }

  try {
    return await server.fetch(request, process.env, {});
  } catch (error) {
    console.error("SSR Handler Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error", 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }), 
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
