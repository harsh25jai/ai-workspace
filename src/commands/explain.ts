import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { getSkillsForFile } from '../skills/activator';

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /(?:import\s+(?:[\w*{}\s,]+\s+from\s+)?|import\s+)['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const pkg = match[1] || match[2];
    if (pkg) imports.push(pkg);
  }
  return imports;
}

function resolveSafeFilePath(cwd: string, filePath: string): string {
  const rootDir = fs.realpathSync(cwd);
  const resolvedPath = fs.realpathSync(path.resolve(rootDir, filePath));

  if (!resolvedPath.startsWith(rootDir + path.sep) && resolvedPath !== rootDir) {
    console.error(`Error: Path escapes repository root: ${filePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const stat = fs.statSync(resolvedPath);
  if (!stat.isFile()) {
    console.error(`Error: Not a regular file: ${filePath}`);
    process.exit(1);
  }

  return resolvedPath;
}

export const explainCommand = new Command('explain')
  .description('Explain a source file\'s role, dependencies, and matched skills')
  .argument('<file>', 'Path to the source file relative to repo root')
  .action(async (filePath: string): Promise<void> => {
    const cwd = process.cwd();
    const resolvedPath = resolveSafeFilePath(cwd, filePath);
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
        console.log(`  - ${skill.name} (${skill.type || 'general'}, ${skill.importance})`);
      }
    } else {
      console.log('\nMatched Skills: (none)');
    }

    console.log('------------------------');
  });
