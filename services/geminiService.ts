
import { GoogleGenAI, Type } from "@google/genai";
import { MeetingAnalysis } from "../types";
import { fileToBase64 } from "../utils";

const SYSTEM_INSTRUCTION = `
You are the "Decision Dynamo". Your goal is to transform messy meetings into crystal-clear decisions.
Analyze the provided meeting recording (video/audio) and optional slides.
Extract structured decisions, action items, risks, and open questions.
Be precise. Distinguish between a discussion and a final decision.
If an owner is not explicitly stated but implied, infer it and mark confidence accordingly.
Timestamps should be in HH:MM:SS format.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A high-level executive summary of the meeting." },
    keyChanges: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 3-5 key things that changed or were agreed upon." 
    },
    decisions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          decision: { type: Type.STRING, description: "The explicit decision made." },
          owner: { type: Type.STRING, description: "Who is responsible for this decision." },
          timestamp: { type: Type.STRING, description: "HH:MM:SS when decision happened." },
          slideRef: { type: Type.STRING, description: "Reference to slide number or visual if applicable." }
        },
        required: ["topic", "decision", "owner", "timestamp"]
      }
    },
    actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          owner: { type: Type.STRING },
          due: { type: Type.STRING, description: "Suggested due date or timeframe." },
          confidence: { type: Type.NUMBER, description: "Confidence score 0.0 to 1.0" },
          timestamp: { type: Type.STRING, description: "HH:MM:SS" }
        },
        required: ["task", "owner", "confidence", "timestamp"]
      }
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
          timestamp: { type: Type.STRING, description: "HH:MM:SS" }
        },
        required: ["risk", "severity", "timestamp"]
      }
    },
    openQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          timestamp: { type: Type.STRING, description: "HH:MM:SS" }
        },
        required: ["question", "timestamp"]
      }
    }
  },
  required: ["summary", "decisions", "actions", "risks", "openQuestions"]
};

export const analyzeMeeting = async (mediaFile: File, slideFile?: File): Promise<MeetingAnalysis> => {
  // Always create a fresh instance to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-pro-preview';

  const mediaBase64 = await fileToBase64(mediaFile);
  
  const parts: any[] = [
    {
      inlineData: {
        mimeType: mediaFile.type,
        data: mediaBase64
      }
    }
  ];

  if (slideFile) {
    const slideBase64 = await fileToBase64(slideFile);
    parts.push({
      inlineData: {
        mimeType: slideFile.type,
        data: slideBase64
      }
    });
    parts.push({ text: "Use the attached slides to cross-reference decisions and provide slide references." });
  }

  parts.push({ text: "Generate the Clarity Sheet based on the meeting recording." });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as MeetingAnalysis;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Check for the specific error that indicates API key selection is needed
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_INVALID");
    }
    
    throw error;
  }
};
