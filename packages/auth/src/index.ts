import { db } from "@AMC/db";
import * as schema from "@AMC/db/schema/auth";
import { env } from "@AMC/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "patient",
      },
      birthday: {
        type: "string",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
      },
      specialization: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [nextCookies()],
});
