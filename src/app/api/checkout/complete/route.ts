import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

const payloadSchema = z.object({
  paymentIntentId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["card", "ach", "financing", "paypal"]),
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
    const { paymentIntentId, name, email, company, notes, paymentMethod } = payloadSchema.parse(
      await request.json(),
    );

    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });

    if (!paymentIntent) {
      return NextResponse.json({ error: "Payment intent not found" }, { status: 404 });
    }

    const acceptableStatuses = new Set(["succeeded", "processing", "requires_capture"]);
    if (!acceptableStatuses.has(paymentIntent.status)) {
      return NextResponse.json(
        { error: `Payment intent not ready (status: ${paymentIntent.status})` },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { paymentIntentId },
      select: { id: true, orderNumber: true },
    });

    if (existingOrder) {
      return NextResponse.json({ success: true, orderId: existingOrder.id, orderNumber: existingOrder.orderNumber });
    }

    const cookieStore = await cookies();
    const cartSessionId = cookieStore.get("cart_session")?.value;

    const cart = await prisma.cart.findFirst({
      where: {
        paymentIntentId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                specifications: true,
              },
            },
            customBuild: {
              include: {
                components: {
                  include: { component: true },
                  orderBy: { position: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart not found for payment" }, { status: 400 });
    }

    const userId = session?.user?.id ?? cart.userId ?? null;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: `EZC-${nanoid(8).toUpperCase()}`,
          userId,
          cartId: cart.id,
          paymentIntentId,
          subtotalCents: cart.subtotalCents,
          taxCents: cart.taxCents,
          totalCents: cart.totalCents,
          currency: (paymentIntent.currency ?? cart.currency).toUpperCase(),
          paymentStatus: paymentIntent.status === "succeeded" ? "PAID" : "AUTHORIZED",
          status: "PROCESSING",
          paymentMethod,
          notes,
          billingAddress: JSON.stringify({ name, email, company }),
          shippingAddress: JSON.stringify({ name, email, company }),
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              customBuildId: item.customBuildId,
              name: item.product?.name ?? item.customBuild?.name ?? "Custom Build",
              subtitle: item.product?.headline ?? item.customBuild?.summary ?? undefined,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
              lineTotalCents: item.lineTotalCents,
              metadata: item.customBuild
                ? JSON.stringify({
                    components: item.customBuild.components.map((component) => ({
                      kind: component.kind,
                      name: component.component.name,
                    })),
                  })
                : undefined,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotalCents: 0,
          taxCents: 0,
          totalCents: 0,
          paymentIntentId: null,
          status: "converted",
          sessionId: cartSessionId ?? cart.sessionId,
        },
      });

      return createdOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Checkout completion failed", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid completion data" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to finalize checkout" }, { status: 400 });
  }
}
