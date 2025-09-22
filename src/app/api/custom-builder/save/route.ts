import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { ComponentKind } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  subtotalCents: z.number().int().nonnegative(),
  estimatedWattage: z.number().int().nonnegative(),
  minimumPsu: z.number().int().nonnegative(),
  components: z
    .array(
      z.object({
        kind: z.nativeEnum(ComponentKind),
        componentId: z.string(),
        priceCents: z.number().int().nonnegative(),
      }),
    )
    .min(4),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const data = payloadSchema.parse(body);

    const build = await prisma.customBuild.create({
      data: {
        name: `Custom Build ${new Date().toLocaleDateString()}`,
        slug: `custom-${nanoid(10)}`,
        summary: "Saved from builder",
        basePriceCents: data.subtotalCents,
        totalPriceCents: data.subtotalCents,
        adjustmentsCents: 0,
        estimatedWattage: data.estimatedWattage,
        configuration: JSON.stringify(data),
        userId: session.user.id,
        components: {
          create: data.components.map((component, index) => ({
            componentId: component.componentId,
            kind: component.kind,
            position: index,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, buildId: build.id, slug: build.slug });
  } catch (error) {
    console.error("Failed to save custom build", error);
    return NextResponse.json({ error: "Unable to save build" }, { status: 400 });
  }
}
