import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { Lock, Mail, User, ShieldCheck, ArrowRight, Calendar, Stethoscope, Users } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { useState } from "react";

const SPECIALIZATIONS = [
  "General Practice",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Oncology",
  "Dermatology",
  "Psychiatry",
  "Emergency Medicine",
  "Other",
];

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      birthday: "",
      gender: "",
      specialization: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          role: role,
          birthday: value.birthday,
          gender: value.gender,
          ...(role === "doctor" && { specialization: value.specialization }),
        } as any,
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Account registration successful", {
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
      onChange: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        birthday: z.string().min(1, "Birthday is required"),
        gender: z.string().min(1, "Gender is required"),
        specialization: z.string(),
      }).refine((data) => {
        if (role === "doctor" && !data.specialization) {
          return false;
        }
        return true;
      }, {
        message: "Specialization is required for doctors",
        path: ["specialization"],
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-md relative z-10 fade-in-up mt-8">
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
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-colors duration-500" />

        <div className="relative mb-6 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-slate-950/50 border border-slate-800 mb-4 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Register Node</h1>
          <p className="text-slate-400 text-sm">Join the centralized medical infrastructure.</p>
        </div>

        {/* Role Selector */}
        <div className="flex p-1 bg-slate-950/50 border border-slate-800 rounded-xl mb-6 relative z-10">
          <button
            onClick={() => setRole("patient")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              role === "patient" 
                ? "bg-slate-800 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" /> Patient
          </button>
          <button
            onClick={() => setRole("doctor")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              role === "doctor" 
                ? "bg-indigo-500/20 text-indigo-300 shadow-md border border-indigo-500/30" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 relative"
        >
          <div>
            <form.Field name="name">
              {(field) => (
                <div className="space-y-1.5">
                  <label htmlFor={field.name} className="text-sm font-medium text-slate-300 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      placeholder={role === "doctor" ? "Dr. Jane Smith" : "Jane Smith"}
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

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="birthday">
              {(field) => (
                <div className="space-y-1.5">
                  <label htmlFor={field.name} className="text-sm font-medium text-slate-300 ml-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
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

            <form.Field name="gender">
              {(field) => (
                <div className="space-y-1.5">
                  <label htmlFor={field.name} className="text-sm font-medium text-slate-300 ml-1">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none"
                    >
                      <option value="" disabled>Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
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

          {role === "doctor" && (
            <div>
              <form.Field name="specialization">
                {(field) => (
                  <div className="space-y-1.5">
                    <label htmlFor={field.name} className="text-sm font-medium text-slate-300 ml-1">
                      Specialization
                    </label>
                    <div className="relative">
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none"
                      >
                        <option value="" disabled>Select specialization...</option>
                        {SPECIALIZATIONS.map(spec => (
                          <option key={spec} value={spec.toLowerCase()}>{spec}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
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
          )}

          <div>
            <form.Field name="email">
              {(field) => (
                <div className="space-y-1.5">
                  <label htmlFor={field.name} className="text-sm font-medium text-slate-300 ml-1">
                    Secure Email
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
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      placeholder="admin@hospital.com"
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
                <div className="space-y-1.5">
                  <label htmlFor={field.name} className="text-sm font-medium text-slate-300 ml-1">
                    Master Password
                  </label>
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
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
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

          <div className="pt-4">
            <form.Subscribe>
              {(state) => (
                <button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting}
                  className="w-full relative flex items-center justify-center py-3.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] group"
                >
                  {state.isSubmitting ? (
                    "Provisioning..."
                  ) : (
                    <>
                      <span>Initialize Account</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </form.Subscribe>
          </div>
          
          <div className="mt-4 text-xs text-center text-slate-500">
            By registering, you agree to AMC's strict data compliance & HIPAA policies.
          </div>
        </form>
      </div>

      <div className="mt-6 text-center">
        <p className="text-slate-400 text-sm">
          Node already active?{" "}
          <button
            onClick={onSwitchToSignIn}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}