# Resume Tailor AI

An AI-powered resume tailoring application that generates job-specific resumes optimized for ATS systems and human recruiters.

## Features

- 🎯 **AI-Powered Tailoring**: Uses Claude AI to analyze job descriptions and customize your resume
- 📝 **Smart Keyword Optimization**: Incorporates relevant keywords from job postings naturally
- 📊 **Match Score**: Shows how well your experience matches the job requirements
- 📥 **Word Document Export**: Download your tailored resume as a .docx file
- 🔒 **Truthful Generation**: Never fabricates or exaggerates experience
- ⚡ **ATS Optimized**: Formatted for Applicant Tracking Systems

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude AI (Anthropic)
- **Document Generation**: docx.js

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd jobapplication
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Paste Job Description**: Copy and paste the full job description from the job posting
2. **Generate Resume**: Click "Generate Tailored Resume" to create a customized version
3. **Review**: Check the preview and optimization notes
4. **Download**: Export as a Word document ready for submission

## Project Structure

```
├── app/
│   ├── api/
│   │   └── generate-resume/
│   │       └── route.ts       # API endpoint for Claude
│   ├── components/
│   │   ├── JobDescriptionForm.tsx
│   │   ├── LoadingState.tsx
│   │   └── ResumePreview.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── candidateData.ts       # Your base experience
│   ├── generateDocx.ts        # Word document generation
│   ├── systemPrompt.ts        # AI instructions
│   └── types.ts               # TypeScript types
└── README.md
```

## Customization

### Updating Your Experience

Edit `/lib/candidateData.ts` to update your personal information, skills, and work experience.

### Modifying AI Behavior

Edit `/lib/systemPrompt.ts` to adjust how the AI tailors resumes. You can:
- Change the output format
- Adjust tailoring rules
- Modify truthfulness constraints
- Add industry-specific instructions

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |

## License

MIT

## Author

Johnson Ojo - [johnsonoojo@gmail.com](mailto:johnsonoojo@gmail.com)
