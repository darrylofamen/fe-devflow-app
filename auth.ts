import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { api } from "@/lib/api";
import { ActionResponse } from "@/types/global";
import { IAccountDoc } from "@/database/account.model";
import { SignInSchema } from "@/lib/validation";
import Credentials from "next-auth/providers/credentials";
import { IUserDoc } from "@/database/user.model";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,

    // ---------------------------------------------
    //  Credentials Provider (email + password)
    // ---------------------------------------------
    Credentials({
      async authorize(credentials) {
        // (1) VALIDATE INPUT USING ZOD
        const validatedFields = SignInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          // (2) FIND ACCOUNT USING EMAIL AS PROVIDER ACCOUNT ID
          const { data: existingAccount } = (await api.accounts.getByproviderAccountId(
            email
          )) as ActionResponse<IAccountDoc>;

          if (!existingAccount) return null;

          // (3) GET THE USER DOCUMENT FROM ACCOUNT.userId
          const { data: existingUser } = (await api.users.getById(
            existingAccount.userId.toString()
          )) as ActionResponse<IUserDoc>;

          if (!existingUser) return null;

          // (4) COMPARE PASSWORD
          const isValidPassword = await bcrypt.compare(password, existingAccount.password!);

          // (5) RETURN USER OBJECT → triggers signIn() callback next
          if (isValidPassword) {
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image,
            };
          }
        }

        // FAILED AUTH
        return null;
      },
    }),
  ],

  callbacks: {
    // --------------------------------------------------------
    // SESSION CALLBACK
    // --------------------------------------------------------
    // Runs EVERY TIME session is checked:
    // - useSession() on client
    // - auth() on server
    // - getServerSession()
    // Purpose: expose extra fields from JWT → session.user
    async session({ session, token }) {
      // copy JWT.sub (userId) to session.user.id
      session.user.id = token.sub as string;
      return session;
    },

    // --------------------------------------------------------
    // JWT CALLBACK
    // --------------------------------------------------------
    // When does it run?
    // 1) On first sign-in (credentials or OAuth)
    // 2) On every page load (session read)
    // 3) On any API call that checks auth()
    //
    // Purpose:
    // - Persist fields inside JWT
    // - Fetch database user to update JWT.sub = userId
    async jwt({ token, account }) {
      // Runs only on initial sign-in (account exists only on sign-in)
      if (account) {
        // Determine providerAccountId depending on credentials or OAuth
        const providerAccountId = account.type === "credentials" ? token.email! : account.providerAccountId!;

        // Get account from database
        const { data: existingAccount, success } = (await api.accounts.getByproviderAccountId(
          providerAccountId
        )) as ActionResponse<IAccountDoc>;

        if (!success || !existingAccount) return token;

        const userId = existingAccount.userId;

        // Save userId into token.sub
        if (userId) token.sub = userId.toString();
      }

      // On subsequent requests, it just returns the token untouched
      return token;
    },

    // --------------------------------------------------------
    // signIn CALLBACK
    // --------------------------------------------------------
    // Runs AFTER successful authorize() or OAuth login
    // Purpose:
    // - For OAuth: create user/account in DB if needed
    // - For Credentials: simply allow login
    async signIn({ user, profile, account }) {
      // Credentials login does NOT go to OAuth creation → allow login
      if (account?.type === "credentials") return true;

      // If OAuth but something missing → deny login
      if (!account || !user) return false;

      // Prepare user info for DB save
      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!,
        username: account.provider === "github" ? (profile?.login as string) : (user.name?.toLowerCase() as string),
      };

      // Call backend to create/update user + account
      const { success } = (await api.auth.oAuthSignIn({
        user: userInfo,
        provider: account.provider as "github" | "google",
        providerAccountId: account.providerAccountId,
      })) as ActionResponse;

      // Allow login only if DB creation/update was successful
      return success;
    },
  },
});
