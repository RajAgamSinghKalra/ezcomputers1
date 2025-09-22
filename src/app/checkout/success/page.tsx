import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Order Confirmed",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const orderNumberParam = params.order;
  const orderNumber = Array.isArray(orderNumberParam) ? orderNumberParam[0] : orderNumberParam;
  const session = await getServerSession(authOptions);

  return (
    <div className="container flex flex-col items-center gap-6 py-20 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold text-foreground">Thank you for your purchase!</h1>
        <p className="text-sm text-foreground-muted">
          {orderNumber
            ? `Order ${orderNumber} is now in our production queue. You will receive status updates as we prepare and ship your system.`
            : "Your payment was received and we are preparing your order. You will receive status updates as we prepare and ship your system."}
        </p>
      </div>
      <div className="space-y-2 text-sm text-foreground-muted">
        <p>We just sent a confirmation email with a receipt and next steps.</p>
        <p>Our build engineers will review your configuration and begin assembly shortly.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {session?.user ? (
          <Button asChild size="lg">
            <Link href="/account/orders">View order status</Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href="/auth/login">Create or log into your account</Link>
          </Button>
        )}
        <Button asChild size="lg" variant="secondary">
          <Link href="/prebuilt">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
