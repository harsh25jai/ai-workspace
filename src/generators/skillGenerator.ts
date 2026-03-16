import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';

const SKILL_TEMPLATES: Record<string, string> = {
  javascript: `Skill: JavaScript Backend

Rules:
* Use async/await
* Avoid callbacks
* Prefer ES modules`,
  typescript: `Skill: TypeScript Backend

Rules:
* Provide strong internal typing
* Avoid \`any\` types where possible
* Use explicit return types for public functions`,
  python: `Skill: Python Backend

Rules:
* Follow PEP 8
* Use type hints
* Prefer list comprehensions where readable`,
  csharp: `Skill: C# Backend

Rules:
* Follow standard C# naming conventions
* Use async/await for I/O
* Prefer LINQ for data transformation`,
};

export async function generateSkills(rootDir: string, scannerResult: ScannerResult): Promise<void> {
  const skillsDir = path.join(rootDir, '.ai', 'skills');
  await fs.ensureDir(skillsDir);

  for (const lang of scannerResult.languages) {
    if (SKILL_TEMPLATES[lang]) {
      const skillPath = path.join(skillsDir, `${lang}.skill.md`);
      await fs.writeFile(skillPath, SKILL_TEMPLATES[lang]);
    }
  }
}
