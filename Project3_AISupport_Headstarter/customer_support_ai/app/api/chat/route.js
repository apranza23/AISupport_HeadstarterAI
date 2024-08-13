import { NextResponse } from 'next/server';
import axios from 'axios';
const APIKEY = process.env.GOOGLE_API_KEY;

// Define the system prompt for the AI assistant
const systemPrompt = `You are an advanced AI assistant with a broad knowledge base, including specialized areas such as technology, science, and arts. Your goal is to provide helpful, accurate, and respectful responses.`;


export async function POST(req) {
    const data = await req.json();
    const { GoogleGenerativeAI } = require("@google/generative-ai");
  
    const genAI = new GoogleGenerativeAI(APIKEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(systemPrompt + "\n" + data.map(message => `${message.role}: ${message.content}`).join("\n"));
    const response = await result.response;
    const text = await response.text();
    console.log(text);
   // const cleanedText = text.replace("assistant: ", "").replace(/\n$/, "");
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }