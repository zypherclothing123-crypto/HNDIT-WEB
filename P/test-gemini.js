
// Simple test script for Gemini API (no dotenv)
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AQ.Ab8RN6KHiowDaUz3s7sIw8HOqzSkwm0bQhgqMTHwOsmKNY7k9A"; // Copy from your .env.local
console.log("Using API key:", apiKey.slice(0, 10) + "...");

async function test() {
  try {
    console.log("Initializing Gemini...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    console.log("Calling Gemini API...");
    const result = await model.generateContent("Hello, this is a test!");
    const text = result.response.text();
    console.log("\nSUCCESS! Response from Gemini:\n", text);
  } catch (error) {
    console.error("\nERROR in Gemini API test:");
    console.error(error);
  }
}

test();
