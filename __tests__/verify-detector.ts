import { getDetectionInfo, isAgentEnvironment } from '../src/utils/agentDetector';

console.log('--- Current Environment Detection ---');
const info = getDetectionInfo();
console.log('Detection Info:', JSON.stringify(info, null, 2));
console.log('Is Agent Environment (Fast Check):', isAgentEnvironment());

console.log('\n--- Mocking Environment: Cursor ---');
process.env.TERM_PROGRAM = 'cursor';
const cursorInfo = getDetectionInfo();
console.log('Cursor Info:', JSON.stringify(cursorInfo, null, 2));

console.log('\n--- Mocking Environment: VS Code + Copilot Env Var ---');
process.env.TERM_PROGRAM = 'vscode';
process.env.GITHUB_COPILOT = 'true';
const vscodeCopilotInfo = getDetectionInfo();
console.log('VS Code + Copilot Info:', JSON.stringify(vscodeCopilotInfo, null, 2));
