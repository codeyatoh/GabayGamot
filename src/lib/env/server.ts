import "server-only";

const missingServerEnvMessage = (name: string) =>
  `Missing required server environment variable: ${name}`;

export function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    throw new Error(missingServerEnvMessage("SUPABASE_SERVICE_ROLE_KEY"));
  }

  return value;
}

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY;
}
