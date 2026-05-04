import fs from "fs";
import path from "path";

/**
 * Reads docs/all_projects.md and returns a prompt-ready string.
 * The file format is: ## N. Name, then a business overview paragraph,
 * then bullet points (- **Key:** Value) for the tech stack.
 * Each entry is included as-is — the file is already compact.
 */
export function parseProjectsForPrompt(): string {
  const filePath = path.join(process.cwd(), "docs", "all_projects.md");
  try {
    return fs.readFileSync(filePath, "utf-8").trim();
  } catch {
    return "";
  }
}
