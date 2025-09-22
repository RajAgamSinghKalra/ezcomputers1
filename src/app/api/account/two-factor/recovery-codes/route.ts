import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  decryptTwoFactorSecret,
  generateRecoveryCodes,
  hashRecoveryCodes,
  verifyTotpToken,
  findRecoveryCodeMatch,
} from "@/lib/two-factor";

const payloadSchema = z.object({
  code: z.string().min(6).max(16),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code } = payloadSchema.parse(body);
    const sanitized = code.replace(/\s+/g, "");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorRecoveryCodes: true,
      },
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "Two-factor authentication is not enabled." }, { status: 400 });
    }

    const secret = decryptTwoFactorSecret(user.twoFactorSecret);
    let verified = verifyTotpToken(secret, sanitized);

    if (!verified) {
      const storedCodes: string[] = user.twoFactorRecoveryCodes ? JSON.parse(user.twoFactorRecoveryCodes) : [];
      if (storedCodes.length > 0) {
        const matchIndex = await findRecoveryCodeMatch(sanitized, storedCodes);
        verified = matchIndex >= 0;
      }
    }

    if (!verified) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    const rawCodes = generateRecoveryCodes();
    const hashedCodes = await hashRecoveryCodes(rawCodes);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorRecoveryCodes: JSON.stringify(hashedCodes),
      },
    });

    return NextResponse.json({ success: true, recoveryCodes: rawCodes });
  } catch (error) {
    console.error("Failed to regenerate recovery codes", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to regenerate recovery codes" }, { status: 400 });
  }
}
