import Stripe from "stripe";

const apiVersion: Stripe.StripeConfig["apiVersion"] = "2024-06-20";
const secretKey = process.env.STRIPE_SECRET_KEY;

let stripeClient: Stripe | null = null;

if (secretKey) {
  stripeClient = new Stripe(secretKey, {
    apiVersion,
  });
} else if (process.env.NODE_ENV === "development") {
  console.warn("Stripe secret key is not configured. Checkout will be disabled until STRIPE_SECRET_KEY is set.");
}

export function getStripeClient() {
  if (!stripeClient) {
    throw new Error("Stripe secret key is not configured.");
  }
  return stripeClient;
}
export const stripe = stripeClient;
