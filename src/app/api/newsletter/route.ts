import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

const payloadSchema = z.object({
  email: z.string().email(),
  source: z.string().trim().min(1).max(100).optional(),
  guard: z.string().optional(),
});

type ParsedRequest = {
  data: z.infer<typeof payloadSchema>;
  respondWithRedirect: URL | null;
};

async function parseRequest(request: Request): Promise<ParsedRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const json = await request.json();
    const data = payloadSchema.parse(json);
    if (data.guard) {
      throw new Error("Invalid submission");
    }
    return { data, respondWithRedirect: null };
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    const email = form.get("email");
    const source = form.get("source");

    const data = payloadSchema.parse({
      email,
      source: typeof source === "string" && source.length > 0 ? source : undefined,
      guard: form.get("guard")?.toString(),
    });

    if (data.guard) {
      throw new Error("Invalid submission");
    }

    const referer = request.headers.get("referer");
    try {
      const redirectTarget = referer ? new URL(referer) : new URL(SITE_URL);
      redirectTarget.searchParams.set("newsletter", "success");
      return { data, respondWithRedirect: redirectTarget };
    } catch {
      return { data, respondWithRedirect: new URL(`${SITE_URL}?newsletter=success`) };
    }
  }

  throw new Error("Unsupported content type");
}

export async function POST(request: Request) {
  try {
    const { data, respondWithRedirect } = await parseRequest(request);
    const payload = data;
    const sanitizedEmail = payload.email.toLowerCase();

    const now = new Date();
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    await prisma.newsletterSubscriber.upsert({
      where: { email: sanitizedEmail },
      update: {
        source: payload.source ?? "footer",
        userAgent,
        ipAddress,
        unsubscribedAt: null,
        confirmedAt: now,
      },
      create: {
        email: sanitizedEmail,
        source: payload.source ?? "footer",
        userAgent,
        ipAddress,
        subscribedAt: now,
        confirmedAt: now,
      },
    });

    if (respondWithRedirect) {
      return NextResponse.redirect(respondWithRedirect, { status: 303 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscription failed", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to subscribe right now" }, { status: 500 });
  }
}
