import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testKey() {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Is my OpenAi api is working?" }],
    });
    console.log("API is working!");
    console.log("Model used:", response.model);
    console.log("AI Reply:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error occurred:", error.message);
  }
}

testKey()
