import { execSync } from 'node:child_process';
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncStaticProjects } from './sync-static-projects.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const apps = ['gulbeneser', 'furkanyonat', 'kariyer', 'ai-content-detector'];

for (const app of apps) {
  const appDir = path.join(rootDir, app);
  const distDir = path.join(appDir, 'dist');
  const targetDir = path.join(rootDir, 'public', app);

  console.log(`\n📦 Building ${app} profile...`);

  execSync('npm ci', { cwd: appDir, stdio: 'inherit' });
  execSync('npm run build', { cwd: appDir, stdio: 'inherit' });

  if (!existsSync(distDir)) {
    throw new Error(`Build output not found for ${app} at ${distDir}`);
  }

  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });
  cpSync(distDir, targetDir, { recursive: true });

  console.log(`✅ Copied ${app} build to public/${app}`);
}

console.log('\nAll profile builds completed.');
syncStaticProjects();
