const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
};

export async function verifyTurnstileToken(token: string, remoteIp?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // If not configured, skip verification to avoid blocking local development
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (remoteIp) {
      params.append("remoteip", remoteIp);
    }

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: params,
    });

    if (!res.ok) {
      return false;
    }

    const data = (await res.json()) as TurnstileResponse;
    return Boolean(data.success);
  } catch (error) {
    console.error("Turnstile verification failed", error);
    return false;
  }
}
