import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/formatters";

const PAYMENT_METHOD_LABELS = {
  card: "Credit / Debit Card",
  ach: "Bank Transfer (ACH)",
  financing: "Financing (Affirm)",
  paypal: "PayPal",
} as const;

export const metadata = {
  title: "Order History",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
    },
    orderBy: { placedAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="container space-y-4 py-16">
        <h1 className="text-3xl font-semibold text-foreground">Order history</h1>
        <p className="text-sm text-foreground-muted">
          You haven&apos;t completed any orders yet. Head to the catalog to start building your ultimate rig.
        </p>
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">Order history</h1>
      <div className="grid gap-6">
        {orders.map((order) => (
          <article key={order.id} className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Order {order.orderNumber}</h2>
                <p className="text-xs text-foreground-muted">
                  Placed {order.placedAt.toLocaleDateString()} | Status {order.status}
                </p>
                <p className="text-xs text-foreground-muted">
                  Payment method {order.paymentMethod ? PAYMENT_METHOD_LABELS[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] ?? order.paymentMethod : "Invoice pending"}
                </p>
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatCurrencyFromCents(order.totalCents)}
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-foreground-muted">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{formatCurrencyFromCents(item.lineTotalCents)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

