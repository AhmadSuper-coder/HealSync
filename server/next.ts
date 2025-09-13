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

  // Handle all non-API routes with Next.js
  app.all('*', (req, res, next) => {
    // Skip API routes - they're handled by Express
    if (req.path.startsWith('/api')) {
      return next();
    }
    return handle(req, res);
  });

  log("Next.js integration ready");
}

export function serveStatic(app: Express) {
  // For production, serve Next.js static files
  const nextApp = next({ dev: false });
  const handle = nextApp.getRequestHandler();
  
  nextApp.prepare().then(() => {
    app.all('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      return handle(req, res);
    });
  });
}