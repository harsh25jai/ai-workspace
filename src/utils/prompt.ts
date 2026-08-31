import readline from 'readline';

function createInterface(): readline.Interface {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

export async function promptList<T extends string>(
  message: string,
  choices: readonly T[],
  defaultValue?: T
): Promise<T> {
  const defaultChoice = defaultValue && choices.includes(defaultValue) ? defaultValue : choices[0];
  console.log(message);
  choices.forEach((choice, index) => {
    const marker = choice === defaultChoice ? '>' : ' ';
    console.log(` ${marker} ${index + 1}) ${choice}`);
  });

  const rl = createInterface();
  try {
    while (true) {
      const answer = await new Promise<string>((resolve) => {
        rl.question(`Choice [${choices.indexOf(defaultChoice) + 1}]: `, resolve);
      });
      const trimmed = answer.trim();
      if (!trimmed) return defaultChoice;
      const index = Number.parseInt(trimmed, 10);
      if (index >= 1 && index <= choices.length) return choices[index - 1];
      console.log(`Enter a number between 1 and ${choices.length}.`);
    }
  } finally {
    rl.close();
  }
}

export async function promptConfirm(message: string, defaultValue = true): Promise<boolean> {
  const hint = defaultValue ? 'Y/n' : 'y/N';
  const rl = createInterface();
  try {
    const answer = await new Promise<string>((resolve) => {
      rl.question(`${message} (${hint}) `, resolve);
    });
    const trimmed = answer.trim().toLowerCase();
    if (!trimmed) return defaultValue;
    return trimmed === 'y' || trimmed === 'yes';
  } finally {
    rl.close();
  }
}
