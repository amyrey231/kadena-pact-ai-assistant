import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 25000,
});

const SYSTEM_PROMPT = `You are a Senior Kadena Pact Security Researcher. Audit the provided code for these 6 Advanced Vulnerability Classes:

1. CAPABILITY & GUARD MISUSE: Missing 'with-capability' or using 'keyset-ref-guard' without defined keysets.
2. REENTRANCY & ATOMICITY: Safe state changes in complex 'defpacts'.
3. CROSS-CHAIN INTEGRITY: Proper 'yield' and 'resume' guards in defpacts to prevent replay attacks.
4. TABLE & SCHEMA SECURITY: Unprotected 'insert'/'update' or lack of 'enforce' on sensitive decimal fields.
5. FORMAL VERIFICATION: Lack of '@model' properties. Suggest a specific Z3 property (e.g., conserves-mass).
6. GOVERNANCE HOLES: Hardcoded 'admin' keysets or missing 'upgrade' capability guards.

Output Format (Strict JSON):
Return a JSON object with a "findings" array. Each object MUST include:
- "severity": "High", "Medium", or "Low"
- "function_name": Affected function/step.
- "issue_title": Short title.
- "explanation": Why it is dangerous.
- "recommendation": Corrected Pact code.
- "fv_property": A suggested Pact @model property for formal verification (e.g. "(property (conserves-mass))").

Return { "findings": [] } if the code is safe.`;

export async function POST(req: Request) {
  try {
    // 1. Safe parsing of the incoming request
    const body = await req.json();
    const { code } = body;

    // 2. Strict Input Validation (Prevents 500 errors if the frontend sends a blank request)
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return NextResponse.json(
        { error: "No valid Pact code provided for analysis." }, 
        { status: 400 }
      );
    }

    // 3. Upgraded to the 70B model for enterprise-grade Pact reasoning
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT }, 
        { role: "user", content: code }
      ],
      response_format: { type: "json_object" }, 
    });

    const result = response.choices[0].message.content;
    
    // 4. Fallback JSON parsing to guarantee the frontend never crashes
    let parsedResult;
    try {
        parsedResult = JSON.parse(result || '{"findings": []}');
    } catch (parseError) {
        console.error("Failed to parse LLM output:", result);
        return NextResponse.json({ findings: [] }); 
    }

    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error("Audit Error:", error);
    return NextResponse.json(
      { error: "Security analysis engine failed to process request." }, 
      { status: 500 }
    );
  }
}