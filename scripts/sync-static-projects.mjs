import { cpSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const projectsDir = path.join(rootDir, 'projects');
const publicProjectsDir = path.join(rootDir, 'public', 'projects');
const publicProjelerDir = path.join(rootDir, 'public', 'projeler');

export function syncStaticProjects() {
  if (!existsSync(projectsDir)) {
    console.warn('\n⚠️ Projects directory not found; skipping copy to public/projects');
    return;
  }

  console.log('\n📁 Syncing static project pages...');

  const targets = [
    { label: 'public/projects', dir: publicProjectsDir },
    { label: 'public/projeler', dir: publicProjelerDir }
  ];

  for (const { label, dir } of targets) {
    rmSync(dir, { recursive: true, force: true });
    cpSync(projectsDir, dir, { recursive: true });
    console.log(`✅ Copied projects to ${label}`);
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  syncStaticProjects();
}
