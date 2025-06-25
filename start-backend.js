#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting Erasmus Journey Backend Server...");
console.log("📍 Location: server/");
console.log("🌐 URL: http://localhost:5000");
console.log("⏹️  Press Ctrl+C to stop\n");

const serverPath = path.join(__dirname, "server");

const child = spawn("npm", ["run", "dev"], {
  cwd: serverPath,
  stdio: "inherit",
  shell: true,
});

child.on("error", (error) => {
  console.error("❌ Error starting server:", error.message);
  console.log("\n💡 Try running manually:");
  console.log("   cd server");
  console.log("   npm install");
  console.log("   npm run dev");
});

child.on("close", (code) => {
  console.log(`\n📴 Backend server stopped with code ${code}`);
});

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down backend server...");
  child.kill("SIGINT");
});
