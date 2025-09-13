import express, { type Express } from "express";
import next from "next";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupNext(app: Express, server: Server) {
  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  // Handle all routes with Next.js (including API routes)
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  log("Next.js integration ready");
}

export function serveStatic(app: Express) {
  // For production, serve Next.js static files
  const nextApp = next({ dev: false });
  const handle = nextApp.getRequestHandler();
  
  nextApp.prepare().then(() => {
    app.all('*', (req, res) => {
      return handle(req, res);
    });
  });
}