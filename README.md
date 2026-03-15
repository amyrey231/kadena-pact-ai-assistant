Kadena Pact AI Assistant 🛡️

An automated security auditor for the Kadena Pact smart contract language. Built for the 2026 Kadena AI Security Challenge.

 Overview
Kadena Pact AI Assistant is a high-performance web interface designed to help developers identify security vulnerabilities, logical flaws, and authorization risks in Pact modules before on-chain deployment.

Key Features
- Intelligent Static Analysis: Uses LLM reasoning to detect Pact-specific risks.
- 5-Point Security Scan: Covers Capabilities, Keysets, State Modification, Defpacts, and Function Visibility.
- Automated Patching: Provides one-click copyable code fixes for every detected issue.
- Risk Scoring: Categorizes findings by High, Medium, and Low severity.
- Developer-First UI: Built with Next.js, Tailwind CSS, and the Monaco Editor (VS Code engine).

 Tech Stack
- Framework: Next.js 15 (App Router)
- AI Engine: Groq (Llama-3.1-8b-instant)
- UI: Tailwind CSS & Lucide Icons
- Editor: @monaco-editor/react

💻 Local Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env.local` file and add your Groq API Key:
   `GROQ_API_KEY=your_key_here`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

📖 Usage Instructions
1. Paste your Kadena Pact module into the editor.
2. Use the "Load Sample" buttons to test the auditor's detection capabilities.
3. Click "Run Audit".
4. Review the generated Security Report and apply the recommended fixes.