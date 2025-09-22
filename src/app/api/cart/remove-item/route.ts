import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  itemId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { itemId } = payloadSchema.parse(await request.json());

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    const cart = await prisma.cart.findUnique({ where: { id: item.cartId } });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const cartSessionId = cookieStore.get("cart_session")?.value;
    const isAuthorized = session?.user?.id
      ? cart.userId === session.user.id
      : cart.sessionId && cart.sessionId === cartSessionId;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const totals = await prisma.cartItem.groupBy({
      by: ["cartId"],
      where: { cartId: item.cartId },
      _sum: { lineTotalCents: true },
    });

    const subtotal = totals[0]?._sum.lineTotalCents ?? 0;
    await prisma.cart.update({
      where: { id: item.cartId },
      data: {
        subtotalCents: subtotal,
        totalCents: subtotal,
        paymentIntentId: null,
        status: "active",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove cart item", error);
    return NextResponse.json({ error: "Unable to update cart" }, { status: 400 });
  }
}



