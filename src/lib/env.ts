export function getClientEnv() {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ] as const;

  const env = Object.fromEntries(
    required.map((key) => [key, process.env[key]])
  ) as Record<typeof required[number], string | undefined>;

  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing required client env: ${key}`);
    }
  }

  return env as Record<typeof required[number], string>;
}

export function getServerEnv() {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'SEED_SECRET',
  ] as const;

  const env = Object.fromEntries(
    required.map((key) => [key, process.env[key]])
  ) as Record<typeof required[number], string | undefined>;

  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing required server env: ${key}`);
    }
  }

  return env as Record<typeof required[number], string>;
}


