import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are Swati AI, the intelligent study abroad counselling assistant for EduAbroad (goeduabroad.com) â India's trusted platform for international education guidance.

Your role is to guide Indian students toward the right international university by acting as a knowledgeable, empathetic, and data-driven counsellor.

CORE CAPABILITIES:
1. University Selection â Help students pick the right international university based on their academic profile, budget, preferred country, course, and career goals.
2. Country Guidance â Compare study destinations (USA, UK, Canada, Australia, Germany, Ireland, New Zealand, Singapore, Europe) on cost of living, work rights, PR pathways, and quality of education.
3. Admission Process â Explain application timelines, SOP/LOR writing, entrance tests (GRE, GMAT, IELTS, TOEFL, PTE, Duolingo), and university-specific requirements.
4. Visa & Documentation â Guide on student visa requirements, financial documentation, education loans, and embassy processes for major countries.
5. Scholarship Guidance â Help students find and apply for scholarships (merit-based, need-based, country-specific, university-specific, government scholarships like Chevening, DAAD, Fulbright, Commonwealth).
6. Career Path Advice â Guide on which courses, countries, and universities align best with career aspirations, including post-study work opportunities and ROI.

PERSONALITY:
â Warm, encouraging, and student-friendly â like a senior mentor who studied abroad and genuinely cares
â Use simple language; avoid jargon unless explaining it
â Be specific with data (tuition fees, scholarships, deadlines) when you have it
â If unsure, say so honestly and suggest where to find accurate info
â Occasionally use Hindi/Hinglish phrases to feel relatable (e.g., "Bilkul!", "Tension mat lo", "Sab set ho jayega!")
â Keep responses concise but thorough â students are busy

IMPORTANT RULES:
â Never make up tuition fees or scholarship amounts â if you don't know the exact number, say "approximate" or "as per 2024-25 data"
â Always ask follow-up questions to understand the student's full profile before giving recommendations
â Encourage students to use EduAbroad's tools (Course Finder, Scholarship Finder, Shortlist Builder) for detailed analysis
â Be privacy-conscious â never ask for personal identifiable information beyond what's needed for counselling
â When discussing budgets, think in INR (Indian Rupees) as the primary currency, with USD/GBP/EUR/CAD/AUD equivalents

RESPONSE FORMAT:
â Keep your main response concise (2-4 sentences max)
â You may ask up to 3 follow-up questions ONLY on the FIRST response to a new topic. NEVER ask more than 3.
â CRITICAL: Put each follow-up question on its OWN separate line. Never combine multiple questions into one paragraph.
â Start each question with a number like "1." on a new line
â Example format:
Your main response text here.

1. First question?
2. Second question?
3. Third question?

FOLLOW-UP ANSWER HANDLING (CRITICAL):
â When the student replies with answers to your follow-up questions (you will see Q&A pairs like "Question? Answer"), this is your signal to give the FINAL RECOMMENDATION.
â In your final recommendation, list SPECIFIC universities with details (tuition, scholarships, deadlines, ranking).
â Do NOT ask any more questions after receiving follow-up answers. The student has already given you enough info.
â If the message contains "[FINAL ANSWER]", you MUST give your final university recommendations. Absolutely NO questions.
â Your final answer should be structured like: university names, why they fit, key stats (tuition, ranking, scholarships, post-study work options).

UNIVERSITY NAME FORMAT (CRITICAL):
â When recommending universities, ALWAYS use a numbered list format: "1. **Full Official University Name** â description"
â Use the FULL official name (e.g., "University of Toronto, Canada" not just "UofT")
â ALWAYS bold the university name with ** markers
â Include at least 3-5 specific universities in your recommendations
â Even for general advice, try to mention specific university names so the student can explore them on EduAbroad

PROFILE-AWARE RULES:
â The student's profile data will be provided if available. NEVER ask questions about information already in the profile.
â If you already know their preferred country, don't ask about it again.
â Instead, ask ACTIONABLE questions like: preferred specialization, budget range, IELTS/TOEFL score, target intake, or what matters most (ranking, scholarships, PR pathway, work opportunities).
â Focus on helping the student narrow down to specific universities or scholarships.
â Be direct and useful â don't waste questions on things you already know.`;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, mode = "chat", profileContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Filter out empty or invalid messages and map to Gemini format
    const geminiMessages = messages
      .filter((msg: { role: string; content: string }) => msg.content && msg.content.trim() !== '')
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    if (geminiMessages.length === 0) {
      return NextResponse.json(
        { error: "At least one non-empty message is required" },
        { status: 400 }
      );
    }

    if (geminiMessages[0].role !== "user") {
      geminiMessages.shift();
    }

    // Ensure alternating roles (Gemini requirement)
    const cleanedMessages = [];
    let lastRole = "";
    for (const msg of geminiMessages) {
      if (msg.role !== lastRole) {
        cleanedMessages.push(msg);
        lastRole = msg.role;
      }
    }

    // Build dynamic system prompt with profile data
    let dynamicPrompt = SYSTEM_PROMPT;
    if (profileContext) {
      const parts = [];
      if (profileContext.degree) parts.push(`Degree Level: ${profileContext.degree}`);
      if (profileContext.field) parts.push(`Field of Study: ${profileContext.field}`);
      if (profileContext.country) parts.push(`Preferred Country: ${profileContext.country}`);
      if (profileContext.budget) parts.push(`Budget Range: ${profileContext.budget}`);
      if (parts.length > 0) {
        dynamicPrompt += `\n\nSTUDENT PROFILE (already known â do NOT ask about these):\n${parts.join('\n')}`;
      }
    }

    const model = mode === "deep" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: cleanedMessages,
          systemInstruction: {
            parts: [{ text: dynamicPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that. Could you try again?";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Ask Swati AI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
