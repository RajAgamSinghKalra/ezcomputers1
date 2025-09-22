import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { productId, quantity } = payloadSchema.parse(await request.json());

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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
          userId: session?.user?.id ?? null,
          sessionId: session?.user?.id ? null : cartSessionId,
          subtotalCents: 0,
          taxCents: 0,
          totalCents: 0,
        },
      });
    }

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          lineTotalCents: (existing.quantity + quantity) * existing.unitPriceCents,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPriceCents: product.basePriceCents,
          lineTotalCents: product.basePriceCents * quantity,
        },
      });
    }

    const totals = await prisma.cartItem.groupBy({
      by: ["cartId"],
      where: { cartId: cart.id },
      _sum: { lineTotalCents: true },
    });

    const newSubtotal = totals[0]?._sum.lineTotalCents ?? 0;

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
    console.error("Failed to add product to cart", error);
    return NextResponse.json({ error: "Unable to add product" }, { status: 400 });
  }
}



