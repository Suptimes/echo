
import { GoogleGenAI, Type } from "@google/genai";
import { Datelist, UserCuratedSummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Processes transcript specifically for updating the user's bio/profile
 */
export async function processTranscriptToBio(transcript: string): Promise<UserCuratedSummary> {
  const prompt = `
    Based on the following conversation transcript, refine the user's profile bio.
    The goal is to make them sound desirable, authentic, and clear about who they are.
    
    TRANSCRIPT:
    ${transcript}

    REQUIREMENTS:
    Return a JSON object with:
    - description: A pleasant, curated bio (1-2 sentences).
    - currentMood: Their current vibe (e.g., "Reflective", "High-Energy").
    - primaryIntent: What they are seeking right now.
    - interests: A list of 3-5 interests extracted from the conversation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            currentMood: { type: Type.STRING },
            primaryIntent: { type: Type.STRING },
            interests: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["description", "currentMood", "primaryIntent", "interests"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error updating bio:", error);
    return {
      description: "A soul in search of beauty and depth. Curious about the world and ready to meet like-minded people.",
      currentMood: "Open-minded",
      primaryIntent: "Socializing",
      interests: ["Art", "Travel", "Conversation"]
    };
  }
}

/**
 * Processes transcript specifically for discovery (Datelists)
 */
export async function processTranscriptToDatelists(transcript: string): Promise<{
  traits: string[],
  intents: string[],
  datelists: Datelist[],
  userSummary: UserCuratedSummary
}> {
  const prompt = `
    Based on the following conversation transcript from a user onboarding for a dating app, 
    analyze their personality, intents, and social goals.
    
    TRANSCRIPT:
    ${transcript}

    REQUIREMENTS:
    1. Extract 3-5 personality traits.
    2. Identify 2-3 dating/social intents.
    3. Generate 3-5 "Datelists" (like Spotify playlists) with specific profiles.
    4. CREATE A USER SUMMARY: Write a desirable, pleasant-to-read bio for the user.

    Use varied, high-quality images for profiles.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            intents: { type: Type.ARRAY, items: { type: Type.STRING } },
            userSummary: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                currentMood: { type: Type.STRING },
                primaryIntent: { type: Type.STRING },
                interests: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["description", "currentMood", "primaryIntent", "interests"]
            },
            datelists: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  mood: { type: Type.STRING },
                  description: { type: Type.STRING },
                  profiles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        age: { type: Type.NUMBER },
                        avatar: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        intentMatch: { type: Type.STRING },
                        reasoning: { type: Type.STRING }
                      },
                      required: ["id", "name", "age", "avatar", "summary", "intentMatch", "reasoning"]
                    }
                  }
                },
                required: ["id", "title", "mood", "description", "profiles"]
              }
            }
          },
          required: ["traits", "intents", "datelists", "userSummary"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error processing transcript:", error);
    return {
      traits: ["Adventurous", "Thoughtful"],
      intents: ["Discovery"],
      userSummary: {
        description: "Looking for something real.",
        currentMood: "Curious",
        primaryIntent: "Discovery",
        interests: ["Music"]
      },
      datelists: []
    };
  }
}
