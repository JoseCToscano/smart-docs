import NextAuth from "next-auth";
import { cache } from "react";
import { Session } from "next-auth";
import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth) as () => Promise<Session>;

export { auth, handlers, signIn, signOut };
