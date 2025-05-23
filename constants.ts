
import { LanguageOption } from './types';

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const GEMINI_PROMPT_TEMPLATE = `
You are an expert AI code reviewer. Your primary goal is to analyze the provided code snippet and offer constructive feedback to improve its quality, readability, maintainability, and adherence to best practices. Additionally, provide a revised version of the code that incorporates your suggestions.

Original Code ([LANGUAGE]):
\`\`\`[LANGUAGE_LOWERCASE]
[CODE_PLACEHOLDER]
\`\`\`

Respond strictly in the following format. Do not add any other text outside this structure:

<REVIEW_FEEDBACK_START>
[Your detailed feedback here. Be specific. Mention positive aspects and areas for improvement. You can use markdown for formatting the feedback, like lists or bold text.]
<REVIEW_FEEDBACK_END>

<REVISED_CODE_START language="[LANGUAGE_LOWERCASE]">
[Your revised code here. Ensure this code is clean and directly usable. Do not wrap this section in markdown backticks, just provide the raw code.]
<REVISED_CODE_END>

Focus on:
- Clarity and conciseness.
- Naming conventions (e.g., camelCase for JS/TS, snake_case for Python).
- Code structure and organization.
- Potential bugs or edge cases.
- Performance optimizations (if applicable and obvious).
- Readability and appropriate comments (explain complex parts, not obvious ones).
- Modern language features and idioms for [LANGUAGE].
- Eliminating redundant code.
- Improving overall aesthetics and "usability" of the code for other developers.
- Correctness and functionality preservation (or improvement).
- Security considerations if applicable.
`;

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'rust', label: 'Rust' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'shell', label: 'Shell/Bash' },
  { value: 'plaintext', label: 'Plain Text' },
];
    