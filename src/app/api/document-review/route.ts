import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const maxDuration = 60;

type Category = "sop" | "lor" | "resume";

interface Body {
  category: Category;
  fileUrl: string;
  fileName?: string;
  profile?: {
    degree?: string;
    program?: string;
    countries?: string[];
  };
}

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const OUTPUT_SHAPE = `
Return ONLY valid JSON, no markdown fences, in exactly this shape:
{
  "score": <integer 0-100>,
  "verdict": "<six words or fewer>",
  "summary": "<2-3 sentences, plain English, addressed to the student as 'you'>",
  "strengths": ["<specific thing that works, quote the document where useful>"],
  "issues": [
    {
      "title": "<short problem name>",
      "severity": "high" | "medium" | "low",
      "why": "<one sentence on why it hurts the application>",
      "fix": "<one concrete action the student can take today>"
    }
  ],
  "checklist": [
    { "item": "<requirement>", "ok": true|false, "note": "<short note>" }
  ]
}
Be specific. Quote or paraphrase actual lines from the document rather than giving
generic advice. If the document is unreadable, empty, or is clearly not the type of
document expected, say so in "summary", set score to 0, and leave arrays empty.`;

function promptFor(category: Category, profile?: Body["profile"]): string {
  const ctx = profile
    ? `The student is applying for a ${profile.degree || ""} in ${
        profile.program || "their chosen field"
      }${
        profile.countries?.length ? `, targeting ${profile.countries.join(", ")}` : ""
      }. Judge the document against that goal.`
    : "";

  if (category === "sop") {
    return `You are a senior admissions counsellor reviewing a Statement of Purpose written by an Indian student applying to universities abroad. ${ctx}

Assess:
- Opening: does it earn attention, or is it a cliche ("Since childhood I have been fascinated by...")?
- Specificity: are there concrete projects, numbers, named courses, named professors — or vague claims?
- Why this course: is the academic motivation clear and evidenced?
- Why this country/university: is it researched, or interchangeable with any other university?
- Career plan: is the post-study goal concrete and plausible?
- Structure and flow: paragraph logic, transitions, repetition.
- Language: grammar, tone, overwriting, filler.
- Length: flag if outside roughly 800-1200 words.
- Red flags: unsupported claims, excessive flattery, anything that reads as AI-generated or templated.

Checklist items to evaluate: clear opening hook, specific academic evidence, named course/university reasons, defined career goal, appropriate length, error-free language.

${OUTPUT_SHAPE}`;
  }

  if (category === "lor") {
    return `You are a senior admissions counsellor reviewing a Letter of Recommendation submitted by an Indian student applying abroad. ${ctx}

CRITICAL RULE: a recommendation letter must be written by the recommender, not the student. Do NOT rewrite the content, do NOT suggest better wording for the recommender's opinions, and do NOT draft replacement sentences. Your job is to check whether the letter is COMPLETE and CREDIBLE as a document. If anything you would say amounts to helping the student author the letter themselves, leave it out.

Check only:
- Is it on official letterhead, or does it look like a plain document?
- Is the recommender's full name, designation, institution, official email and phone present?
- Is it signed and dated?
- Is the relationship to the student stated (what they taught, for how long)?
- Does it cite specific incidents and evidence, or only generic praise? (Report this as an observation, do not fix it.)
- Is it addressed appropriately?
- Is the scan legible and complete, with no missing pages?

In "issues", every "fix" must be an action the STUDENT can legitimately take — for example "ask your professor to add their institutional email" or "request a signed copy on department letterhead". Never a wording change.

Add this exact line at the end of "summary": "Any changes must be made by your recommender, not by you."

${OUTPUT_SHAPE}`;
  }

  return `You are a senior admissions counsellor reviewing a resume/CV from an Indian student applying to universities abroad. ${ctx}

Assess:
- Length: one page for undergraduates, up to two for postgraduates with work experience.
- Impact: are achievements quantified, or just responsibilities listed?
- Verbs: weak ("worked on", "responsible for") versus strong action verbs.
- Relevance: is the content aligned with the target programme, or padded with unrelated items?
- Structure: education, experience, projects, skills, achievements — logical order, consistent formatting.
- Gaps: unexplained time gaps.
- Errors: dates, tense consistency, typos, inconsistent formatting.
- Contact details: email, phone, LinkedIn present and professional.

Checklist items to evaluate: appropriate length, quantified achievements, strong action verbs, consistent formatting, complete contact details, relevance to target programme.

${OUTPUT_SHAPE}`;
}

async function callGemini(
  model: string,
  apiKey: string,
  prompt: string,
  docPart: Record<string, unknown>
) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, docPart],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Document review is not configured. Add GEMINI_API_KEY." },
        { status: 503 }
      );
    }

    let body: Body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { category, fileUrl, profile } = body;

    if (!["sop", "lor", "resume"].includes(category)) {
      return NextResponse.json(
        { error: "This document type is reviewed by our team, not automatically." },
        { status: 400 }
      );
    }
    if (!fileUrl) {
      return NextResponse.json({ error: "No file selected." }, { status: 400 });
    }

    const ext = (fileUrl.split("?")[0].split(".").pop() || "").toLowerCase();
    const mimeType = MIME[ext];
    const isDocx = ext === "docx";

    if (!mimeType && !isDocx) {
      return NextResponse.json(
        {
          error:
            ext === "doc"
              ? "Old .doc files can't be read. Save it as .docx or PDF and upload again."
              : "Unsupported file type. Upload a PDF, DOCX, JPG or PNG.",
        },
        { status: 415 }
      );
    }

    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      return NextResponse.json(
        { error: "Could not open that file. Try re-uploading it." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    if (buffer.byteLength > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is too large to review. Keep it under 15 MB." },
        { status: 413 }
      );
    }

    let docPart: Record<string, unknown>;

    if (isDocx) {
      let text = "";
      try {
        const out = await mammoth.extractRawText({ buffer });
        text = (out?.value || "").trim();
      } catch (e) {
        console.error("Document review: mammoth failed", e);
        return NextResponse.json(
          { error: "Could not read that Word file. Try uploading a PDF." },
          { status: 422 }
        );
      }
      if (text.length < 100) {
        return NextResponse.json(
          {
            error:
              "That file looks empty or is mostly images. Upload a PDF instead.",
          },
          { status: 422 }
        );
      }
      docPart = {
        text: `--- DOCUMENT TEXT (extracted from a Word file, so layout and letterhead are not visible) ---\n\n${text.slice(
          0,
          60000
        )}`,
      };
    } else {
      docPart = {
        inline_data: { mime_type: mimeType, data: buffer.toString("base64") },
      };
    }

    const prompt = promptFor(category, profile);

    let model = PRIMARY_MODEL;
    let res = await callGemini(model, GEMINI_API_KEY, prompt, docPart);
    if (!res.ok) {
      model = FALLBACK_MODEL;
      res = await callGemini(model, GEMINI_API_KEY, prompt, docPart);
    }

    if (!res.ok) {
      const detail = await res.text();
      console.error("Document review: Gemini error", res.status, detail);
      return NextResponse.json(
        { error: "The reviewer is busy right now. Try again in a minute." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    let parsed: any;
    try {
      parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ""));
    } catch {
      console.error("Document review: bad JSON", raw.slice(0, 400));
      return NextResponse.json(
        { error: "Could not read the review. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      score: Number(parsed.score) || 0,
      verdict: parsed.verdict || "",
      summary: parsed.summary || "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
      model,
    });
  } catch (e: any) {
    console.error("Document review error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: !!process.env.GEMINI_API_KEY,
    supports: ["sop", "lor", "resume"],
    fileTypes: ["pdf", "docx", "png", "jpg", "jpeg", "webp"],
  });
}