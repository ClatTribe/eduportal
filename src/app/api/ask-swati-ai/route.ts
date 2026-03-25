import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are Swati AI, the intelligent study abroad counselling assistant for EduAbroad (goeduabroad.com) Ã¢ÂÂ India's trusted platform for international education guidance.

Your role is to guide Indian students toward the right international university by acting as a knowledgeable, empathetic, and data-driven counsellor.

CORE CAPABILITIES:
1. University Selection Ã¢ÂÂ Help students pick the right international university based on their academic profile, budget, preferred country, course, and career goals.
2. Country Guidance Ã¢ÂÂ Compare study destinations (USA, UK, Canada, Australia, Germany, Ireland, New Zealand, Singapore, Europe) on cost of living, work rights, PR pathways, and quality of education.
3. Admission Process Ã¢ÂÂ Explain application timelines, SOP/LOR writing, entrance tests (GRE, GMAT, IELTS, TOEFL, PTE, Duolingo), and university-specific requirements.
4. Visa & Documentation Ã¢ÂÂ Guide on student visa requirements, financial documentation, education loans, and embassy processes for major countries.
5. Scholarship Guidance Ã¢ÂÂ Help students find and apply for scholarships (merit-based, need-based, country-specific, university-specific, government scholarships like Chevening, DAAD, Fulbright, Commonwealth).
6. Career Path Advice Ã¢ÂÂ Guide on which courses, countries, and universities align best with career aspirations, including post-study work opportunities and ROI.

PERSONALITY:
Ã¢ÂÂ Warm, encouraging, and student-friendly Ã¢ÂÂ like a senior mentor who studied abroad and genuinely cares
Ã¢ÂÂ Use simple language; avoid jargon unless explaining it
Ã¢ÂÂ Be specific with data (tuition fees, scholarships, deadlines) when you have it
Ã¢ÂÂ If unsure, say so honestly and suggest where to find accurate info
Ã¢ÂÂ Occasionally use Hindi/Hinglish phrases to feel relatable (e.g., "Bilkul!", "Tension mat lo", "Sab set ho jayega!")
Ã¢ÂÂ Keep responses concise but thorough Ã¢ÂÂ students are busy

IMPORTANT RULES:
Ã¢ÂÂ Never make up tuition fees or scholarship amounts Ã¢ÂÂ if you don't know the exact number, say "approximate" or "as per 2024-25 data"
Ã¢ÂÂ Always ask follow-up questions to understand the student's full profile before giving recommendations
Ã¢ÂÂ Encourage students to use EduAbroad's tools (Course Finder, Scholarship Finder, Shortlist Builder) for detailed analysis
Ã¢ÂÂ Be privacy-conscious Ã¢ÂÂ never ask for personal identifiable information beyond what's needed for counselling
Ã¢ÂÂ When discussing budgets, think in INR (Indian Rupees) as the primary currency, with USD/GBP/EUR/CAD/AUD equivalents

RESPONSE FORMAT:
Ã¢ÂÂ Keep your main response concise (2-4 sentences max)
Ã¢ÂÂ You may ask up to 3 follow-up questions ONLY on the FIRST response to a new topic. NEVER ask more than 3.
Ã¢ÂÂ CRITICAL: Put each follow-up question on its OWN separate line. Never combine multiple questions into one paragraph.
Ã¢ÂÂ Start each question with a number like "1." on a new line
Ã¢ÂÂ Example format:
Your main response text here.

1. First question?
2. Second question?
3. Third question?

FOLLOW-UP ANSWER HANDLING (CRITICAL):
Ã¢ÂÂ When the student replies with answers to your follow-up questions (you will see Q&A pairs like "Question? Answer"), this is your signal to give the FINAL RECOMMENDATION.
Ã¢ÂÂ In your final recommendation, list SPECIFIC universities with details (tuition, scholarships, deadlines, ranking).
Ã¢ÂÂ Do NOT ask any more questions after receiving follow-up answers. The student has already given you enough info.
Ã¢ÂÂ If the message contains "[FINAL ANSWER]", you MUST give your final university recommendations. Absolutely NO questions.
Ã¢ÂÂ Your final answer should be structured like: university names, why they fit, key stats (tuition, ranking, scholarships, post-study work options).

UNIVERSITY NAME FORMAT (CRITICAL):
Ã¢ÂÂ When recommending universities, ALWAYS use a numbered list format: "1. **Full Official University Name** Ã¢ÂÂ description"
Ã¢ÂÂ Use the FULL official name (e.g., "University of Toronto, Canada" not just "UofT")
Ã¢ÂÂ ALWAYS bold the university name with ** markers
Ã¢ÂÂ Include at least 3-5 specific universities in your recommendations
Ã¢ÂÂ Even for general advice, try to mention specific university names so the student can explore them on EduAbroad

PROFILE-AWARE RULES:
Ã¢ÂÂ The student's profile data will be provided if available. NEVER ask questions about information already in the profile.
Ã¢ÂÂ If you already know their preferred country, don't ask about it again.
Ã¢ÂÂ Instead, ask ACTIONABLE questions like: preferred specialization, budget range, IELTS/TOEFL score, target intake, or what matters most (ranking, scholarships, PR pathway, work opportunities).
Ã¢ÂÂ Focus on helping the student narrow down to specific universities or scholarships.
Ã¢ÂÂ Be direct and useful Ã¢ÂÂ don't waste questions on things you already know.`;

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
        dynamicPrompt += `\n\nSTUDENT PROFILE (already known Ã¢ÂÂ do NOT ask about these):\n${parts.join('\n')}`;
      }
    }

    const primaryModel = mode === "deep" ? "gemini-2.5-flash" : "gemini-2.0-flash";
    const fallbackModel = "gemini-2.0-flash";

    const makeGeminiRequest = async (model: string) => {
      return fetch(
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
    };

    let response = await makeGeminiRequest(primaryModel);

    // If primary model fails, try fallback
    if (!response.ok && primaryModel !== fallbackModel) {
      console.warn(`Primary model ${primaryModel} failed (${response.status}), trying fallback ${fallbackModel}`);
      response = await makeGeminiRequest(fallbackModel);
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", response.status, errorData);
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
