import { compare } from "bcrypt";
import Credentials from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: "Credentials",

            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        roles: {
                            include: { role: true },
                        },
                    },
                });

                if (!user) return null;
                if (!user.active) return null;

                const passwordValid = await compare(
                    credentials.password,
                    user.password,
                );

                if (!passwordValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles.map(
                        (r) => r.role.name,
                    ),
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.roles = user.roles;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.roles = token.roles as string[];
            }

            return session;
        },
    },

    pages: {
        signIn: "/login",
    },
};
