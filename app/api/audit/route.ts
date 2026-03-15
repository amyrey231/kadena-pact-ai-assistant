import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 20000,
});

const SYSTEM_PROMPT = `You are an elite Kadena Pact security auditor. Analyze the provided Pact module for:
1. Capabilities (defcap): Missing checks in sensitive functions.
2. Authorization: Weak keyset enforcement or missing 'with-capability'.
3. Multi-step Pacts (defpact): Lack of rollbacks or authorization on secondary steps.
4. State Modification: Updating tables/schemas before authorization.
5. Guards: Hardcoded keys or unsafe admin configs.
6. Public Functions: Unrestricted access to critical logic.

Return a JSON object with a "findings" array. Each object MUST have:
- "severity": "High", "Medium", or "Low"
- "function_name": Affected function/step.
- "issue_title": Short descriptive title.
- "explanation": Why it is dangerous.
- "recommendation": Corrected Pact code.

Return { "findings": [] } if the code is safe.`;

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: code }
      ],
      response_format: { type: "json_object" }, 
    });

    const result = response.choices[0].message.content;
    return NextResponse.json(JSON.parse(result || '{"findings": []}'));
  } catch (error) {
    console.error("AI Audit Error:", error);
    return NextResponse.json({ error: "Failed to analyze code" }, { status: 500 });
  }
}