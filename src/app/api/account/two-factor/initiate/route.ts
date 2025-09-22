import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateTwoFactorQrCode, generateTwoFactorSecret } from "@/lib/two-factor";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const label = session.user.email ?? session.user.name ?? `user-${session.user.id}`;
    const { secret, otpauthUrl } = generateTwoFactorSecret(label);
    const qrCode = await generateTwoFactorQrCode(otpauthUrl);

    return NextResponse.json({ secret, otpauthUrl, qrCode });
  } catch (error) {
    console.error("Failed to initiate two-factor setup", error);
    return NextResponse.json({ error: "Unable to start two-factor setup" }, { status: 400 });
  }
}
