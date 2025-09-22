import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyTurnstileToken } from "@/lib/turnstile";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(20),
  guard: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);
    if (data.guard) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const remoteIp = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const verified = await verifyTurnstileToken(data.turnstileToken ?? "", remoteIp);
    if (!verified) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
    }

    await prisma.contactRequest.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company,
        subject: data.subject,
        message: data.message,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form submission failed", error);
    return NextResponse.json({ error: "Unable to submit request" }, { status: 400 });
  }
}
