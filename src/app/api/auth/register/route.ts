import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyTurnstileToken } from "@/lib/turnstile";

const payloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  guard: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const data = payloadSchema.parse(await request.json());

    if (data.guard) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const remoteIp = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const verified = await verifyTurnstileToken(data.turnstileToken ?? "", remoteIp);
    if (!verified) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Account already exists" }, { status: 400 });
    }

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: await hash(data.password, 12),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Unable to create account" }, { status: 400 });
  }
}
