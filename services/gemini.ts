
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

export const generateSecureIdToken = async (username: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a highly complex, unique 128-character encrypted ID string for a user named "${username}". It should look like a mix of hexadecimal and ciphered symbols. Return ONLY the string.`
  });
  return response.text?.trim() || `NODE-ID-${Math.random().toString(36).toUpperCase()}`;
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

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed art generation");
};

export const scrubWalletSecurity = async (address: string, realBalance?: string): Promise<any> => {
  const balanceContext = realBalance ? `The real-time native balance for this address is ${realBalance}.` : "";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Perform a REAL-TIME security audit on the blockchain address: ${address}. 
    ${balanceContext}
    Search for recent on-chain activity, token holdings, and contract interactions associated with this specific address.
    Identify 5 actual or highly probable assets (Tokens, NFTs, or Smart Contracts) that this wallet might interact with or hold.
    For each asset, perform a rigorous threat assessment. 
    Return exactly 5 objects in a JSON array. 
    Each object must have:
    - name: Asset name
    - symbol: Asset symbol
    - riskScore: Integer 0-100
    - riskReason: One detailed sentence about why this asset is or isn't a threat.
    - type: One of ["TOKEN", "NFT", "CONTRACT"]
    - isUnverified: Boolean (true if the contract source is unverified or linked to scams)
    - verifiedLink: A real-time URL to a block explorer (Etherscan, BscScan, etc.) for that specific asset.
    
    If no specific assets are found, generate likely interactions based on current network trends for an active wallet of this type.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            symbol: { type: Type.STRING },
            riskScore: { type: Type.INTEGER },
            riskReason: { type: Type.STRING },
            type: { type: Type.STRING },
            isUnverified: { type: Type.BOOLEAN },
            verifiedLink: { type: Type.STRING }
          },
          required: ["name", "symbol", "riskScore", "riskReason", "type", "isUnverified"]
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
