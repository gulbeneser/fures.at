import { spawnSync } from 'node:child_process';
import { existsSync, rmSync, cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const travelDir = path.join(rootDir, 'travel');
const travelDist = path.join(travelDir, 'dist');
const publicTravelDir = path.join(rootDir, 'public', 'travel');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

export function buildTravelProject() {
  if (!existsSync(travelDir)) {
    console.warn('\n⚠️ Travel project directory not found; skipping build.');
    return;
  }

  console.log('\n🧭 Building travel assistant project...');

  const hasPackageJson = existsSync(path.join(travelDir, 'package.json'));
  if (!hasPackageJson) {
    console.warn('⚠️ No package.json found for travel project; skipping.');
    return;
  }

  const nodeModulesDir = path.join(travelDir, 'node_modules');
  if (existsSync(nodeModulesDir)) {
    rmSync(nodeModulesDir, { recursive: true, force: true });
  }

  const hasLockFile = existsSync(path.join(travelDir, 'package-lock.json'));
  const installCommand = hasLockFile ? ['ci'] : ['install'];

  console.log('📦 Installing travel project dependencies...');
  run('npm', installCommand, { cwd: travelDir });

  if (existsSync(travelDist)) {
    rmSync(travelDist, { recursive: true, force: true });
  }

  console.log('🛠️ Running travel project build...');
  run('npm', ['run', 'build'], { cwd: travelDir });

  console.log('📂 Copying travel build output to public/travel...');
  if (existsSync(publicTravelDir)) {
    rmSync(publicTravelDir, { recursive: true, force: true });
  }
  cpSync(travelDist, publicTravelDir, { recursive: true });

  console.log('✅ Travel project build complete.');
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  buildTravelProject();
}
