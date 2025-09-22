import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  encryptTwoFactorSecret,
  generateRecoveryCodes,
  hashRecoveryCodes,
  verifyTotpToken,
} from "@/lib/two-factor";

const payloadSchema = z.object({
  secret: z.string().min(16),
  code: z.string().min(6).max(16),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { secret, code } = payloadSchema.parse(body);
    const sanitizedCode = code.replace(/\s+/g, "");

    const isValid = verifyTotpToken(secret, sanitizedCode);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    const encrypted = encryptTwoFactorSecret(secret);
    const rawCodes = generateRecoveryCodes();
    const hashedCodes = await hashRecoveryCodes(rawCodes);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: encrypted,
        twoFactorRecoveryCodes: JSON.stringify(hashedCodes),
      },
    });

    return NextResponse.json({ success: true, recoveryCodes: rawCodes });
  } catch (error) {
    console.error("Failed to activate two-factor", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to enable two-factor" }, { status: 400 });
  }
}
