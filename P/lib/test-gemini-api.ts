
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  console.log("Testing Gemini API...");
  
  try {
    // Try to list models (this might not be supported, but let's test generateContent first)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, world!");
    const text = result.response.text();
    console.log("Success! Response:", text);
  } catch (e) {
    console.error("Test failed:", e);
  }
}

test();
