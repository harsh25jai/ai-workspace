import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { getSkillsForFile } from '../skills/activator';

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

export const explainCommand = new Command('explain')
  .description('Explain a source file\'s role, dependencies, and matched skills')
  .argument('<file>', 'Path to the source file relative to repo root')
  .action(async (filePath: string) => {
    const cwd = process.cwd();
    const resolvedPath = path.resolve(cwd, filePath);

    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const relativePath = path.relative(cwd, resolvedPath);
    const content = await fs.readFile(resolvedPath, 'utf8');
    const imports = extractImports(content);
    const skills = await getSkillsForFile(cwd, relativePath);

    const ext = path.extname(relativePath);
    const basename = path.basename(relativePath, ext);
    const dir = path.dirname(relativePath);

    console.log('--- File Explanation ---');
    console.log(`Path: ${relativePath}`);
    console.log(`Directory: ${dir}`);
    console.log(`Name: ${basename}${ext}`);
    console.log(`Size: ${content.length} characters`);

    if (imports.length > 0) {
      console.log('\nImports:');
      for (const imp of imports) {
        console.log(`  - ${imp}`);
      }
    } else {
      console.log('\nImports: (none detected)');
    }

    if (skills.length > 0) {
      console.log('\nMatched Skills:');
      for (const skill of skills) {
        console.log(`  - ${skill.name} (${skill.type}, ${skill.importance})`);
      }
    } else {
      console.log('\nMatched Skills: (none)');
    }

    console.log('------------------------');
  });
