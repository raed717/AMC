import { protectedProcedure, publicProcedure, router } from "../index";
import { patientRouter } from "./patient";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  patient: patientRouter,
});
export type AppRouter = typeof appRouter;
