import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCartPaymentIntent } from "@/lib/payments";

const payloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  paymentMethod: z.enum(["card", "ach", "financing", "paypal"]),
  notes: z.string().optional(),
  guard: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment processor is not configured" },
        { status: 503 },
      );
    }

    const session = await getServerSession(authOptions);
    const { name, email, company, notes, paymentMethod, guard } = payloadSchema.parse(
      await request.json(),
    );

    if (guard) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cartSessionId = cookieStore.get("cart_session")?.value;

    const cart = await prisma.cart.findFirst({
      where: session?.user?.id
        ? { userId: session.user.id }
        : cartSessionId
        ? { sessionId: cartSessionId }
        : { id: "" },
      select: {
        id: true,
        totalCents: true,
        currency: true,
        paymentIntentId: true,
        items: {
          select: { id: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const paymentIntent = await ensureCartPaymentIntent(cart, {
      customer_name: name,
      customer_email: email,
      customer_company: company ?? undefined,
      payment_method_preference: paymentMethod,
      notes,
      user_id: session?.user?.id,
    });

    const clientSecret = paymentIntent.client_secret;
    if (!clientSecret) {
      const refreshed = await getStripeClient().paymentIntents.retrieve(paymentIntent.id);
      if (!refreshed.client_secret) {
        throw new Error("Unable to access payment intent client secret");
      }
      return NextResponse.json({
        clientSecret: refreshed.client_secret,
        paymentIntentId: refreshed.id,
        amount: refreshed.amount,
        currency: refreshed.currency,
      });
    }

    return NextResponse.json({
      clientSecret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error("Checkout initialization failed", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid checkout data" }, { status: 422 });
    }
    return NextResponse.json({ error: "Checkout failed" }, { status: 400 });
  }
}
