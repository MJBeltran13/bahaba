// Simple seeding helper to call the Next.js /api/seed endpoint
// Usage examples:
//   node scripts/seed-local.mjs --secret=YOUR_SECRET
//   node scripts/seed-local.mjs --secret=YOUR_SECRET --url=http://localhost:3000
//   SEED_SECRET=YOUR_SECRET npm run seed:local

function parseArgs(argv) {
  const argMap = new Map();
  for (const arg of argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) {
      argMap.set(match[1], match[2]);
    }
  }
  return argMap;
}

async function main() {
  const args = parseArgs(process.argv);
  const secret = args.get('secret')
    || process.env.SEED_SECRET
    || process.env.SEED_TOKEN;
  const baseUrl = args.get('url')
    || process.env.SEED_BASE_URL
    || 'http://localhost:3000';

  if (!secret) {
    console.error('Missing seed secret. Provide via --secret=... or SEED_SECRET env.');
    process.exit(1);
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/seed`;
  console.log(`Seeding via POST ${url}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Seed failed (${res.status}): ${text}`);
    process.exit(1);
  }
  try {
    const json = JSON.parse(text);
    console.log('Seed ok:', json);
  } catch {
    console.log('Seed ok:', text);
  }
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});


