import type { PromptSettings } from "../types/types";

// Helper function to build the prompt
const buildPrompt = (text: string, settings: PromptSettings): string => {
  const formatInstructions =
    settings.outputFormat === "bullets"
      ? "* Use bullet points for the summary\n* Each point should start with an asterisk"
      : settings.outputFormat === "numbered"
      ? "1. Use numbered list\n2. Each point should be numbered sequentially"
      : "Use clear paragraphs separated by blank lines";

  const lengthInstructions = {
    short: "Maximum 3-4 key points or 2 paragraphs",
    medium: "Maximum 6-7 key points or 3-4 paragraphs",
    long: "Maximum 10-12 key points or 5-6 paragraphs",
  }[settings.summaryLength];

  const toneInstructions = {
    professional: "formal business language",
    casual: "conversational tone",
    technical: "precise technical terminology",
  }[settings.toneStyle];

  let prompt = "Generate a meeting summary with these exact requirements:\n";
  prompt += "1. NO introductory phrases\n";
  prompt += "2. NO explanations\n";
  prompt +=
    "3. NO meta-commentary like 'here's the summary' or 'let me help'\n";
  prompt += `4. Use ${toneInstructions}\n`;
  prompt += `5. Length: ${lengthInstructions}\n`;
  prompt += `6. Format: ${formatInstructions}\n\n`;

  // Format headers and sections using proper markdown
  if (settings.includeDatetime) {
    prompt += "Start with meeting datetime in **bold** if mentioned.\n";
  }

  if (settings.includeParticipants) {
    prompt += "Include ### Participants section if mentioned.\n";
  }

  const mainSummaryPrompt =
    settings.customPrompt || "Summarize the key points from this meeting:";
  prompt += `### Summary\n${mainSummaryPrompt}\n\n`;

  if (settings.includeActionItems) {
    prompt += "End with ### Action Items section listing next steps.\n";
  }

  prompt += `\nTransform this meeting transcript into the requested format:\n\n${text}`;

  if (settings.language !== "english") {
    prompt += `\n\nTranslate the final output to ${settings.language}.`;
  }

  prompt +=
    "\n\nRemember to use proper markdown formatting and provide ONLY the final summary without any additional text or explanations.";

  return prompt;
};

const API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export const generateSummary = async (
  text: string,
  settings: PromptSettings
): Promise<string> => {
  if (!text) {
    throw new Error("No text provided for summarization.");
  }

  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error(
      "API key not found. Please add your Groq API key to the .env file."
    );
  }

  try {
    console.log("Making API request with settings:", {
      ...settings,
      text: text.substring(0, 100) + "...",
    });

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3-32b", // Using Mixtral for better instruction following
        messages: [
          {
            role: "system",
            content:
              "You are a meeting summary generator that ONLY outputs the final formatted summary. Never include phrases like 'let me think', 'here's the summary', or any other meta-commentary. Never explain what you're doing. Output should start directly with the summary content using proper markdown formatting.",
          },
          {
            role: "user",
            content: buildPrompt(text, settings),
          },
        ],
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error Response:", data);
      throw new Error(
        data.error?.message || `HTTP error! status: ${response.status}`
      );
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid response format from API");
    }

    // Clean up the response to remove any potential meta-commentary
    let content = data.choices[0].message.content.trim();

    // Remove any common meta-commentary phrases that might appear at the start
    const metaPhrases = [
      "here's the summary:",
      "here is the summary:",
      "summary:",
      "here's a summary",
      "let me summarize",
      "i'll summarize",
      "let me help you",
      "i'll help you",
      "sure,",
      "okay,",
      "alright,",
      "certainly,",
    ];

    // Case-insensitive removal of meta phrases from the start
    const lowerContent = content.toLowerCase();
    for (const phrase of metaPhrases) {
      if (lowerContent.startsWith(phrase.toLowerCase())) {
        content = content.slice(phrase.length).trim();
      }
    }

    // Remove any lines that appear to be meta-commentary
    content = content
      .split("\n")
      .filter(
        (line: string) =>
          !line.toLowerCase().includes("here's") &&
          !line.toLowerCase().includes("let me") &&
          !line.toLowerCase().includes("i'll") &&
          !line.toLowerCase().includes("i will") &&
          !line.toLowerCase().includes("i can")
      )
      .join("\n")
      .trim();

    return content;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};
