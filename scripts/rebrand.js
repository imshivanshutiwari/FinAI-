import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const files = ['README.md', 'SOUL.md', 'AGENTS.md'];

for (const file of files) {
  const path = join(process.cwd(), file);
  try {
    let content = await readFile(path, 'utf-8');
    
    // Replace .dexter with .finai
    content = content.replace(/\.dexter/g, '.finai');
    // Replace Dexter with FinAI
    content = content.replace(/Dexter/g, 'FinAI');
    // Replace dexter with finai
    content = content.replace(/\bdexter\b/g, 'finai');
    
    await writeFile(path, content, 'utf-8');
    console.log(`Rebranded ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}
