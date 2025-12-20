
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Always use the process.env.API_KEY directly for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFacialLiveness = async (base64Image: string): Promise<string> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: "Analyze facial liveness. Check for: 1. Deepfake artifacts, 2. Photo spoofing, 3. Natural skin texture. Provide a 'Liveness Score' 0-100 and a short technical explanation." },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
      ]
    },
  });
  // Use .text property instead of .text()
  return response.text || "Analysis failed.";
};

export const analyzeVoiceLiveness = async (base64Audio: string): Promise<string> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: "Analyze voice for acoustic liveness. Detect synthesized (AI TTS) or replayed audio. Provide a 'Liveness Score' 0-100 and summary." },
        { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
      ]
    }
  });
  return response.text || "Analysis failed.";
};

export const generateNFTArt = async (): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: "Portrait of a random animal in a 'Binary Art Code' style. Subject composed of glowing digital 0s and 1s on black background. Dark cyberpunk aesthetic." },
      ],
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  // Safely iterate through parts to find the image data as per guidelines
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed art generation");
};

export const scrubWalletSecurity = async (address: string): Promise<any> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a blockchain security auditor. Perform a scrub protocol on address ${address}. Generate a JSON list of 4 mock assets with: name, symbol, riskScore (0-100), riskReason (one sentence), type (TOKEN/NFT/CONTRACT).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            symbol: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            riskReason: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          propertyOrdering: ["name", "symbol", "riskScore", "riskReason", "type"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const analyzeRiskSearch = async (query: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this website or blockchain address for security risks: "${query}". Provide a risk rating (SAFE/SUSPICIOUS/DANGEROUS) and 3 bullet points of security facts.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  
  let resultText = response.text || "Analysis failed.";
  
  // Mandatory: Extract URLs from groundingChunks and append them to the response
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks && chunks.length > 0) {
    const urls = chunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string | undefined): uri is string => !!uri);
    
    if (urls.length > 0) {
      resultText += "\n\nSources:\n" + Array.from(new Set(urls)).map(url => `- ${url}`).join('\n');
    }
  }
  
  return resultText;
};

export const transcribeToEncryptedData = async (rawDetails: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform this biometric report into a ciphered alphanumeric stream: "${rawDetails}"`
  });
  return response.text || "ENCRYPTION_STREAM_ERROR";
};

export const generateBiometricHash = async (dataSummary: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 64-char hex hash for: "${dataSummary}". Return only the hash.`
  });
  return response.text?.trim() || "0x000";
};
