import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const distDir = path.resolve('dist');
const releasesDir = path.resolve('releases');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
const version = packageJson.version || '0.0.1';
const zipFileName = `extension-browser-zen-clock-${version}.zip`;
const zipFilePath = path.join(releasesDir, zipFileName);

const output = fs.createWriteStream(zipFilePath);
const archive = archiver('zip', {
  zlib: { level: 9 }, // Maximum compression
});

output.on('close', () => {
  const sizeKb = (archive.pointer() / 1024).toFixed(2);
  console.log(`\n🎉 Package created successfully!`);
  console.log(`📦 File: releases/${zipFileName}`);
  console.log(`📊 Size: ${sizeKb} KB`);
  console.log(`🚀 Ready for upload to Chrome Web Store and Microsoft Edge Add-ons!`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('Archiver warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();
