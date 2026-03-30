import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { QrCode, Lock, Mail, ArrowRight } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import Loader from "./loader";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign in successful", {
              className: "bg-slate-900 border-slate-800 text-slate-50",
            });
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText, {
              className: "bg-slate-900 border-red-500/50 text-red-400",
            });
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-md relative z-10 fade-in-up">
      <style dangerouslySetInnerHTML={{ __html: `
        .fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
        {/* Glow Effects inside card */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-colors duration-500" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500" />

        <div className="relative mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Secure Access</h1>
          <p className="text-slate-400 text-sm">Authenticate to retrieve medical contexts.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5 relative"
        >
          <div>
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <label htmlFor={field.name} className="text-sm font-medium text-slate-300 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-400 text-sm ml-1">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <div>
            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label htmlFor={field.name} className="text-sm font-medium text-slate-300">
                      Password
                    </label>
                    <a href="#" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">Forgot?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-400 text-sm ml-1">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <div className="pt-2">
            <form.Subscribe>
              {(state) => (
                <button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting}
                  className="w-full relative flex items-center justify-center py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] group"
                >
                  {state.isSubmitting ? (
                    "Authenticating..."
                  ) : (
                    <>
                      <span>Sign In via Hub</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-slate-500">Or access via</span>
          </div>
        </div>

        <div className="mt-6">
          <button type="button" className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors gap-2">
            <QrCode className="w-4 h-4 text-teal-400" />
            <span>Scan Medical ID</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-slate-400 text-sm">
          Unregistered facility?{" "}
          <button
            onClick={onSwitchToSignUp}
            className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
          >
            Apply for Node Access
          </button>
        </p>
      </div>
    </div>
  );
}