import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileContext {
  degree?: string;
  field?: string;
  country?: string;
  budget?: string;
  ieltsScore?: string | number;
  program?: string;
  intake?: string;
  name?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "model";
  content: string;
}

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface RequestBody {
  messages: ChatMessage[];
  mode?: "chat" | "deep";
  profileContext?: ProfileContext;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are SAM — the Study Abroad Mentor at EduAbroad (app.goeduabroad.com).

EduAbroad is a premium study-abroad consultancy founded by Harvard-Cambridge and IIM alumni, and an official Cambridge IELTS Learning Partner.
- 2,000+ students placed at universities worldwide
- 2,000+ university partnerships across 30+ countries
- 1,50,000+ courses in database
- 20+ years of combined team experience

LANGUAGE RULES (ABSOLUTE — NON-NEGOTIABLE):
- You MUST respond in English only, always, in every message, without exception.
- Do NOT use Hindi, Hinglish, or any other language under any circumstances.
- Do NOT use phrases like "Bilkul!", "Tension mat lo", "Sab set ho jayega", or any Hindi/Hinglish expressions.
- If a student writes in Hindi or any other language, acknowledge them warmly and respond fully in English.
- Example correct response to a Hindi question: "Great question! IELTS is required by most universities in..."
- Example WRONG response: "Bilkul! IELTS bohot zaroori hai..." — NEVER do this.

YOUR ROLE:
Guide Indian students and their parents through the full study-abroad journey: country selection, university shortlisting, admission requirements, visa, scholarships, and pre-departure preparation.

PERSONALITY & TONE:
- Warm, encouraging, and direct — like a knowledgeable senior who genuinely cares
- Confident and data-driven; cite real fees, requirements, and deadlines when known
- Never vague; if you don't know something, say so honestly and suggest where to verify
- Conversational but professional; no unexplained jargon

CORE CAPABILITIES:
1. University Selection — Match students to universities based on profile, budget, country, program, career goals
2. Country Guidance — Compare UK, Canada, Australia, USA, Germany, Ireland, NZ, Netherlands, Italy, Singapore on cost, work rights, PR pathways, education quality
3. Admission Process — Application timelines, SOP/LOR writing, GRE/GMAT/IELTS/TOEFL/PTE/Duolingo requirements
4. Visa & Documentation — Student visa requirements, financial documentation, education loans, embassy processes
5. Scholarship Guidance — Merit, need-based, country-specific, government scholarships (Chevening, DAAD, Fulbright, Commonwealth, Australia Awards)
6. Career Path Advice — Course-country-university fit for career goals, post-study work opportunities, ROI analysis

RESPONSE FORMAT:
- Keep main response concise (2–4 sentences)
- On the FIRST response to a new topic, ask up to 3 follow-up questions — ONE per line, numbered
- NEVER ask more than 3 questions total
- Example format:
  Your main response here.
  1. First question?
  2. Second question?
  3. Third question?

FOLLOW-UP ANSWER HANDLING:
- When the student has answered your questions, give FINAL RECOMMENDATIONS — specific universities with tuition, scholarships, deadline, ranking
- Do NOT ask more questions after receiving follow-up answers
- If the message contains "[FINAL ANSWER]", give final university recommendations immediately — no more questions

UNIVERSITY RECOMMENDATION FORMAT:
- Always use a numbered list: "1. **Full Official University Name** — why it fits + key stats"
- Use full official names (e.g., "University of Toronto, Canada" not "UofT")
- Bold university names with ** markers
- Include 3–5 specific universities per recommendation

PROFILE-AWARE RULES:
- If the student's profile data is provided, NEVER ask about already-known information
- Ask only for what you still need: specialisation, budget, IELTS score, intake preference, priorities (ranking vs scholarships vs PR)
- Be direct and useful — don't waste the student's time on what you already know

IMPORTANT ACCURACY RULES:
- Never fabricate tuition fees or scholarship amounts — say "approximately" or "as per 2024–25 data" when uncertain
- For IELTS scores, every university has its own exact requirement — don't generalise
- For deadlines, say "please verify on the official university website" if not certain
- Encourage students to use EduAbroad tools: Course Finder, Scholarship Finder, Shortlist Builder at app.goeduabroad.com

BUDGET GUIDANCE (INR/year, tuition + living):
- UK: ₹35–55L/year
- Canada: ₹28–42L/year
- Australia: ₹30–48L/year
- Germany (public): ₹8–14L/year (mostly tuition-free)
- Netherlands: ₹28–38L/year
- USA: ₹45–70L/year
- Ireland: ₹30–45L/year
- Italy: ₹10–18L/year
- Japan: ₹15–22L/year

Always think in INR first, then mention USD/GBP/EUR/CAD/AUD equivalents.
When appropriate, mention EduAbroad's free 30-minute counselling session at app.goeduabroad.com.`;

function buildDynamicPrompt(profileContext?: ProfileContext): string {
  if (!profileContext) return SYSTEM_PROMPT;

  const parts: string[] = [];
  if (profileContext.name) parts.push(`Name: ${profileContext.name}`);
  if (profileContext.degree) parts.push(`Degree Level: ${profileContext.degree}`);
  if (profileContext.field || profileContext.program)
    parts.push(`Field of Study: ${profileContext.field || profileContext.program}`);
  if (profileContext.country) parts.push(`Preferred Country: ${profileContext.country}`);
  if (profileContext.budget) parts.push(`Budget Range: ${profileContext.budget}`);
  if (profileContext.ieltsScore) parts.push(`IELTS Score: ${profileContext.ieltsScore}`);
  if (profileContext.intake) parts.push(`Target Intake: ${profileContext.intake}`);

  if (parts.length === 0) return SYSTEM_PROMPT;

  return (
    SYSTEM_PROMPT +
    `\n\nSTUDENT PROFILE (already known — do NOT ask about these again):\n${parts.join("\n")}`
  );
}

// ─── Gemini API Call ──────────────────────────────────────────────────────────

async function makeGeminiRequest(
  model: string,
  messages: GeminiMessage[],
  systemPrompt: string,
  apiKey: string
): Promise<Response> {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messages,
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
          candidateCount: 1,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    }
  );
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check API key first
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("SAM AI: GEMINI_API_KEY environment variable is not set");
      return NextResponse.json(
        {
          error:
            "SAM AI is not configured. Please add GEMINI_API_KEY to your Vercel environment variables.",
        },
        { status: 503 }
      );
    }

    // Parse body
    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { messages, mode = "chat", profileContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages field must be a non-empty array." },
        { status: 400 }
      );
    }

    // Filter + convert to Gemini format
    const geminiMessages: GeminiMessage[] = messages
      .filter(
        (msg) =>
          msg.content &&
          typeof msg.content === "string" &&
          msg.content.trim() !== ""
      )
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content.trim() }],
      }));

    if (geminiMessages.length === 0) {
      return NextResponse.json(
        { error: "At least one non-empty message is required." },
        { status: 400 }
      );
    }

    // Gemini requires first message to be from "user"
    if (geminiMessages[0].role !== "user") {
      geminiMessages.shift();
    }

    // Enforce alternating roles (Gemini API requirement)
    const cleanedMessages: GeminiMessage[] = [];
    let lastRole = "";
    for (const msg of geminiMessages) {
      if (msg.role !== lastRole) {
        cleanedMessages.push(msg);
        lastRole = msg.role;
      }
    }

    if (cleanedMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages after processing." },
        { status: 400 }
      );
    }

    // Build system prompt with profile data
    const systemPrompt = buildDynamicPrompt(profileContext);

    // Model selection: use gemini-2.5-flash (stable, production-ready)
    // "deep" mode uses the full flash model; "chat" uses the same (lite was unreliable)
    const PRIMARY_MODEL = "gemini-2.5-flash";
    const FALLBACK_MODEL = "gemini-2.0-flash";

    // Try primary model
    let response = await makeGeminiRequest(
      PRIMARY_MODEL,
      cleanedMessages,
      systemPrompt,
      GEMINI_API_KEY
    );

    // Fallback if primary fails
    if (!response.ok) {
      console.warn(
        `SAM AI: Primary model ${PRIMARY_MODEL} failed (${response.status}), trying fallback...`
      );
      response = await makeGeminiRequest(
        FALLBACK_MODEL,
        cleanedMessages,
        systemPrompt,
        GEMINI_API_KEY
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("SAM AI: Gemini API error:", response.status, errorBody);

      if (response.status === 429) {
        return NextResponse.json(
          { error: "SAM is temporarily busy. Please try again in a moment." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Failed to get response from AI. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();

    const candidate = data?.candidates?.[0];

    if (!candidate) {
      return NextResponse.json(
        { error: "No response generated. Please try again." },
        { status: 500 }
      );
    }

    if (candidate.finishReason === "SAFETY") {
      return NextResponse.json({
        response:
          "I'm not able to respond to that request. Please try rephrasing your question.",
      });
    }

    const aiResponse =
      candidate?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that. Could you try again?";

    return NextResponse.json({
      response: aiResponse,
      model: PRIMARY_MODEL,
    });
  } catch (error: unknown) {
    console.error("SAM AI route error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error:
            "Could not connect to the AI service. Please check server connectivity.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// ─── GET — Health Check ───────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  return NextResponse.json({
    status: hasApiKey ? "ok" : "misconfigured",
    service: "SAM AI — EduAbroad Study Abroad Mentor",
    model: "gemini-2.5-flash",
    apiKeyConfigured: hasApiKey,
    hint: hasApiKey
      ? undefined
      : "Add GEMINI_API_KEY to Vercel Environment Variables and redeploy.",
  });
}
