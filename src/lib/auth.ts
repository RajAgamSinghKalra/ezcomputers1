import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  decryptTwoFactorSecret,
  findRecoveryCodeMatch,
  removeRecoveryCodeAt,
  verifyTotpToken,
} from "@/lib/two-factor";

const DEFAULT_ROLE = UserRole.CUSTOMER;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        code: { label: "Two-factor code", type: "text", placeholder: "123456" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
            twoFactorEnabled: true,
            twoFactorSecret: true,
            twoFactorRecoveryCodes: true,
          },
        });

        if (!user?.passwordHash) {
          throw new Error("No account found for that email address.");
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Incorrect password. Please try again.");
        }

        if (user.twoFactorEnabled) {
          const code = credentials.code?.toString().trim().replace(/\s+/g, "");
          if (!code) {
            throw new Error("Two-factor authentication code required.");
          }
          if (!user.twoFactorSecret) {
            throw new Error("Two-factor authentication is not configured properly. Please contact support.");
          }

          const secret = decryptTwoFactorSecret(user.twoFactorSecret);
          let verified = verifyTotpToken(secret, code);

          if (!verified) {
            const storedCodes: string[] = user.twoFactorRecoveryCodes ? JSON.parse(user.twoFactorRecoveryCodes) : [];
            if (storedCodes.length > 0) {
              const matchIndex = await findRecoveryCodeMatch(code, storedCodes);
              if (matchIndex >= 0) {
                verified = true;
                const remainingCodes = removeRecoveryCodeAt(storedCodes, matchIndex);
                await prisma.user.update({
                  where: { id: user.id },
                  data: { twoFactorRecoveryCodes: JSON.stringify(remainingCodes) },
                });
              }
            }
          }

          if (!verified) {
            throw new Error("Invalid two-factor authentication code.");
          }
        }

        const result = {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          role: user.role,
        } satisfies NextAuthUser;

        return result;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole | undefined) ?? DEFAULT_ROLE;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && typeof user === "object" && "role" in user) {
        token.role = (user as NextAuthUser).role ?? DEFAULT_ROLE;
      }
      return token;
    },
  },
};

export type AppSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string;
    role: UserRole;
  };
};
