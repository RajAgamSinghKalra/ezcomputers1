import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  buildId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { buildId } = payloadSchema.parse(await request.json());

    const build = await prisma.customBuild.findUnique({
      where: { id: buildId },
      include: {
        components: {
          include: { component: true },
        },
      },
    });

    if (!build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    if (build.visibility !== "public" && build.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
          userId: session?.user?.id ?? build.userId ?? null,
          sessionId: session?.user?.id ? null : cartSessionId,
          subtotalCents: 0,
          totalCents: 0,
          taxCents: 0,
        },
      });
    }

    const unitPrice = build.totalPriceCents || build.basePriceCents;

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        customBuildId: build.id,
        quantity: 1,
        unitPriceCents: unitPrice,
        lineTotalCents: unitPrice,
        configuration: build.configuration,
      },
    });

    const totals = await prisma.cartItem.groupBy({
      by: ["cartId"],
      where: { cartId: cart.id },
      _sum: { lineTotalCents: true },
    });

    const newSubtotal = totals[0]?._sum.lineTotalCents ?? unitPrice;

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
    console.error("Failed to add saved build to cart", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid build" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to add build" }, { status: 400 });
  }
}
