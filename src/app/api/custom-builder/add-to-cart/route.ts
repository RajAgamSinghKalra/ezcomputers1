import { cookies } from "next/headers";
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
    const body = await request.json();
    const data = payloadSchema.parse(body);

    const cookieStore = await cookies();
    let cartSessionId = cookieStore.get("cart_session")?.value;
    let newSessionId: string | null = null;

    if (!cartSessionId) {
      newSessionId = nanoid(16);
      cartSessionId = newSessionId;
    }

    let cart = session?.user?.id
      ? await prisma.cart.findFirst({ where: { userId: session.user.id } })
      : await prisma.cart.findFirst({ where: { sessionId: cartSessionId } });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session?.user?.id ?? null,
          sessionId: session?.user?.id ? null : cartSessionId,
          subtotalCents: 0,
          taxCents: 0,
          totalCents: 0,
        },
      });
    }

    const customBuild = await prisma.customBuild.create({
      data: {
        name: `Custom Build ${new Date().toLocaleDateString()}`,
        slug: `custom-${nanoid(10)}`,
        summary: "Saved from builder",
        basePriceCents: data.subtotalCents,
        totalPriceCents: data.subtotalCents,
        adjustmentsCents: 0,
        estimatedWattage: data.estimatedWattage,
        configuration: JSON.stringify(data),
        userId: session?.user?.id ?? null,
        components: {
          create: data.components.map((component, index) => ({
            componentId: component.componentId,
            kind: component.kind,
            position: index,
          })),
        },
      },
    });

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        customBuildId: customBuild.id,
        quantity: 1,
        unitPriceCents: data.subtotalCents,
        lineTotalCents: data.subtotalCents,
      },
    });

    const totals = await prisma.cartItem.groupBy({
      by: ["cartId"],
      where: { cartId: cart.id },
      _sum: {
        lineTotalCents: true,
      },
    });

    const newSubtotal = totals[0]?._sum.lineTotalCents ?? data.subtotalCents;

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotalCents: newSubtotal,
        totalCents: newSubtotal,
        paymentIntentId: null,
        status: "active",
      },
    });

    const response = NextResponse.json({ success: true, cartId: cart.id });
    if (newSessionId) {
      response.cookies.set("cart_session", newSessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("Failed to add custom build to cart", error);
    return NextResponse.json({ error: "Unable to add build to cart" }, { status: 400 });
  }
}


