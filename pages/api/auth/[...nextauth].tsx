declare module "next-auth" {
    interface User {
        username: string;
        access_token: string;
    }
    interface Session extends DefaultSession {
        user?: User;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        username: string;
        access_token: string;
    }
}

import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    secret: process.env.SECRET,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "username" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (credentials === undefined) {
                    return null
                }


                let formdata = new FormData();
                formdata.append("username", credentials.username);
                formdata.append("password", credentials.password);
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/auth/token", {
                    method: 'POST',
                    body: formdata,
                    redirect: 'follow'
                });
                const user = await res.json()
                const { access_token } = user;

                if (access_token === undefined) {
                    return null
                }
                // return { name: username, email: access_token}
                // If no error and we have user data, return it
                if (res.ok && user) {
                    return user
                }
                // Return null if user data could not be retrieved
                return null
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            // Persist the OAuth access_token to the token right after signin
            if (user) {
                token.access_token = user.access_token
                token.username = user.username
            }
            return token
        },
        session({ session, token, user }: any) {
            // Send properties to the client, like an access_token from a provider.
            if (token) {
                session.user = token
            }
            return session
        }
    }
}
export default NextAuth(authOptions)