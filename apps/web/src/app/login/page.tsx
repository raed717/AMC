"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import Link from "next/link";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <main className="flex-1 flex flex-col bg-[#020617] text-slate-50 selection:bg-teal-500/30 font-sans min-h-screen relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .glow-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }
      `}} />
      
      <div className="glow-blob bg-teal-500 w-[500px] h-[500px] top-[-100px] left-[-200px]" />
      <div className="glow-blob bg-indigo-600 w-[600px] h-[600px] bottom-[-200px] right-[-100px]" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-teal-500/50 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-teal-400 transition-colors">AMC</span>
        </Link>
        
        {showSignIn ? (
          <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
      </div>
    </main>
  );
}
