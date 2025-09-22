import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { getProductBySlug } from "@/lib/data/products";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3),
  body: z.string().min(20),
});

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { slug } = await context.params;
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = payloadSchema.parse(await request.json());

    await prisma.productReview.create({
      data: {
        productId: product.id,
        userId: session.user.id,
        rating: data.rating,
        title: data.title,
        body: data.body,
        author: session.user.name ?? session.user.email ?? "Verified buyer",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit review", error);
    return NextResponse.json({ error: "Unable to submit review" }, { status: 400 });
  }
}
