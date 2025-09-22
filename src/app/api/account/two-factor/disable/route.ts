import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  decryptTwoFactorSecret,
  findRecoveryCodeMatch,
  verifyTotpToken,
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

    if (!user?.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorRecoveryCodes: null,
        },
      });
      return NextResponse.json({ success: true });
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json({ error: "Two-factor configuration is missing." }, { status: 400 });
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

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to disable two-factor", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to disable two-factor" }, { status: 400 });
  }
}




