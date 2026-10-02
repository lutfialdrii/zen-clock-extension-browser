import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  console.log('🔍 Retrieving GitHub token from osxkeychain...');
  let token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    try {
      const creds = execSync('printf "protocol=https\\nhost=github.com\\n" | git credential-osxkeychain get', { encoding: 'utf8' });
      const match = creds.match(/^password=(.+)$/m);
      if (match) token = match[1].trim();
    } catch {
      // Fallback if osxkeychain not present
    }
  }

  if (!token) {
    throw new Error('Failed to retrieve GitHub token. Set GITHUB_TOKEN or authenticate git with GitHub.');
  }

  const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
  const version = packageJson.version;
  const tag = `v${version}`;
  const repo = 'lutfialdrii/zen-clock-extension-browser';
  const name = `v${version} - Zen Clock: Pomodoro & Muslim Prayer Times`;
  const zipPath = path.resolve(`releases/extension-browser-zen-clock-${version}.zip`);

  if (!fs.existsSync(zipPath)) {
    throw new Error(`Zip artifact not found at ${zipPath}. Run "npm run package:zip" first.`);
  }

  // Extract release notes from CHANGELOG.md for this version
  let releaseNotes = '';
  try {
    const changelog = fs.readFileSync(path.resolve('CHANGELOG.md'), 'utf8');
    const versionHeader = `## [${version}]`;
    const startIndex = changelog.indexOf(versionHeader);
    if (startIndex !== -1) {
      const sub = changelog.slice(startIndex + versionHeader.length);
      const nextHeaderMatch = sub.match(/\n## \[\d+\.\d+\.\d+\]/);
      const endIndex = nextHeaderMatch ? nextHeaderMatch.index : sub.length;
      releaseNotes = sub.slice(0, endIndex).trim();
    }
  } catch {
    // Default fallback
  }

  if (!releaseNotes) {
    releaseNotes = `Release ${tag} of Zen Clock: Pomodoro & Muslim Prayer Times.`;
  }

  console.log(`🚀 Creating/verifying GitHub Release ${tag}...`);
  let releaseData;
  const createRes = await fetch(`https://api.github.com/repos/${repo}/releases`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Zen-Clock-Release-Script',
    },
    body: JSON.stringify({
      tag_name: tag,
      target_commitish: 'main',
      name,
      body: releaseNotes,
      draft: false,
      prerelease: false,
    }),
  });

  if (createRes.status === 201) {
    releaseData = await createRes.json();
    console.log(`✅ Release created: ${releaseData.html_url}`);
  } else if (createRes.status === 422) {
    console.log('ℹ️ Release already exists, fetching existing release info...');
    const getRes = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Zen-Clock-Release-Script',
      },
    });
    if (!getRes.ok) {
      throw new Error(`Failed to fetch existing release: ${getRes.statusText}`);
    }
    releaseData = await getRes.json();
    console.log(`Found release: ${releaseData.html_url}`);
  } else {
    const errorText = await createRes.text();
    throw new Error(`GitHub API error (${createRes.status}): ${errorText}`);
  }

  // Upload or replace asset
  const uploadUrlRaw = releaseData.upload_url;
  const uploadBase = uploadUrlRaw.split('{')[0];
  const assetName = path.basename(zipPath);
  const uploadUrl = `${uploadBase}?name=${encodeURIComponent(assetName)}`;

  console.log(`📦 Checking asset ${assetName} (${(fs.statSync(zipPath).size / 1024).toFixed(2)} KB)...`);
  const zipBuffer = fs.readFileSync(zipPath);

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/zip',
      'Content-Length': String(zipBuffer.length),
      'User-Agent': 'Zen-Clock-Release-Script',
    },
    body: zipBuffer,
  });

  if (uploadRes.status === 201) {
    const assetData = await uploadRes.json();
    console.log(`🎉 Asset uploaded successfully: ${assetData.browser_download_url}`);
  } else if (uploadRes.status === 422) {
    console.log(`ℹ️ Asset ${assetName} already exists on this release.`);
  } else {
    const errText = await uploadRes.text();
    throw new Error(`Asset upload error (${uploadRes.status}): ${errText}`);
  }

  console.log(`\n✨ Release ${tag} is live on GitHub!`);
  console.log(`🔗 URL: ${releaseData.html_url}`);
}

main().catch((err) => {
  console.error('❌ Error publishing release:', err);
  process.exit(1);
});
