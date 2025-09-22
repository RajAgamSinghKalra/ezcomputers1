import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const cartSessionId = cookieStore.get("cart_session")?.value;

    const cart = await prisma.cart.findFirst({
      where: session?.user?.id
        ? { userId: session.user.id }
        : cartSessionId
        ? { sessionId: cartSessionId }
        : { id: "" },
      select: {
        subtotalCents: true,
        items: {
          select: { quantity: true },
        },
      },
    });

    const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
    const subtotalCents = cart?.subtotalCents ?? 0;

    const response = NextResponse.json({ count: itemCount, subtotalCents });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Failed to load cart summary", error);
    return NextResponse.json({ count: 0, subtotalCents: 0 }, { status: 500 });
  }
}
