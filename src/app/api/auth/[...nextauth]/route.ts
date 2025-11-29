import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

console.log("NextAuth route loaded");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET");

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
