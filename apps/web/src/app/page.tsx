"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {
  ShieldCheck,
  QrCode,
  Database,
  Smartphone,
  Lock,
  Zap,
  Server,
  Users,
  Stethoscope,
  ArrowRight,
  Activity,
  Files,
  ArrowRightLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Header from "@/components/header";

// Mock Data for the page
const FEATURES = [
  {
    icon: Database,
    title: "Centralized Records",
    description: "Every diagnosis, lab result, and prescription in one secure vault. No more scattered files across different clinics.",
    span: "md:col-span-2",
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Millisecond retrieval of life-saving data via QR scan.",
    span: "md:col-span-1",
  },
  {
    icon: ArrowRightLeft,
    title: "Seamless Interoperability",
    description: "Public hospitals, private clinics, and pharmacies connected natively.",
    span: "md:col-span-1",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "End-to-end encryption with strict role-based access controls.",
    span: "md:col-span-2",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Issue the Card",
    description: "Patient receives a unique, encrypted QR medical card linked to their decentralized identity.",
  },
  {
    num: "02",
    title: "Scan & Authenticate",
    description: "Authorized medical staff scans the code. Multi-factor authentication ensures only approved personnel gain access.",
  },
  {
    num: "03",
    title: "Instant Context",
    description: "The complete, chronological medical history appears instantly, enabling faster, better clinical decisions.",
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  // Checking API status silently in the background just to keep the functionality
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex-1 bg-background text-foreground selection:bg-emerald-500/30 font-sans overflow-hidden">
      <Header />
      <style dangerouslySetInnerHTML={{ __html: `
        .scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: #22d3ee;
          box-shadow: 0 0 15px 2px rgba(34, 211, 238, 0.6);
          animation: scan 3s ease-in-out infinite;
          top: 0;
          left: 0;
          z-index: 10;
        }
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translateY(240px); }
        }
        .glow-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }
        .fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="glow-blob bg-emerald-500 w-[500px] h-[500px] top-[-100px] left-[-200px]" />
        <div className="glow-blob bg-teal-600 w-[600px] h-[600px] bottom-[-200px] right-[-100px]" />
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          <div className="max-w-2xl fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-emerald-400 text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              <span>The New Standard of Care</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              The Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Patient Story.</span><br />
              In A Single Scan.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl font-light leading-relaxed">
              Eliminate fragmented data. Our intelligent QR-based infrastructure centralizes medical records across public and private healthcare systems, delivering instant, secure access at the point of care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-primary-foreground font-semibold transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                Request Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a href="#" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-card border border-border text-card-foreground hover:bg-muted font-medium transition-all">
                How it works
              </a>
            </div>
          </div>

          {/* Abstract Scanner Visual */}
          <div className="relative mx-auto w-full max-w-[400px] lg:max-w-[500px] aspect-square fade-in-up delay-200">
            <div className="absolute inset-0 bg-card backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl overflow-hidden group">
              {/* Corner brackets */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-lg" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-lg" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-lg" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-lg" />
              
              <div className="relative w-full h-full flex items-center justify-center">
                <QrCode className="w-48 h-48 text-muted-foreground transition-colors duration-500 group-hover:text-emerald-500/50" strokeWidth={1} />
                <div className="scan-line" />
              </div>

              {/* Mock Data overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950/90 to-transparent flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center gap-3 px-4 py-2 bg-card/90 border border-emerald-500/30 rounded-full shadow-lg backdrop-blur-md">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-card-foreground">ID: 8X-99A Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-24 border-t border-border bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The old way is broken.</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 opacity-50">
                  <Files className="w-6 h-6 text-red-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Fragmented History</h4>
                    <p className="text-sm text-muted-foreground">Critical allergies and past treatments lost across different clinic databases.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 opacity-50">
                  <Smartphone className="w-6 h-6 text-orange-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Slow Onboarding</h4>
                    <p className="text-sm text-muted-foreground">Patients fill out the same 5-page forms at every new specialist visit.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-32 h-32 text-emerald-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground relative z-10">The AMC Solution.</h2>
              <p className="text-lg text-foreground mb-8 relative z-10">
                A unified, patient-centric architecture. One dynamic QR code grants instant, encrypted access to a lifetime of medical data, updated in real-time.
              </p>
              <ul className="space-y-4 relative z-10">
                {['Zero Data Loss', 'Instant Context', 'Empowered Patients'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-4">Frictionless Workflow</h2>
            <p className="text-muted-foreground text-lg">Designed for the reality of fast-paced clinical environments.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-slate-800 to-transparent z-0" />
            
            {STEPS.map((step, idx) => (
              <div key={idx} className="relative z-10 bg-background border border-border p-8 rounded-2xl hover:border-emerald-500/30 transition-colors group">
                <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-xl font-bold text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_0_0_rgba(34,211,238,0)] group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 bg-background relative border-y border-border">
        <div className="glow-blob bg-teal-600/20 w-[800px] h-[800px] top-[20%] left-[10%]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4">Uncompromising Infrastructure</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">We built AMC to handle the most critical data in the world, with zero compromises on speed or security.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className={`${feat.span} group bg-card border border-border rounded-3xl p-8 hover:bg-muted hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                  <Icon className="w-10 h-10 text-emerald-400 mb-6" />
                  <h3 className="text-2xl font-bold mb-3 text-card-foreground">{feat.title}</h3>
                  <p className="text-muted-foreground text-lg">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits / Stats */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="p-4">
              <div className="flex items-center justify-center mb-4 text-emerald-400">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">For Doctors</h3>
              <p className="text-muted-foreground">Reduce time spent tracking history by 80%. Make confident, context-rich decisions instantly.</p>
            </div>
            <div className="p-4 pt-12 md:pt-4">
              <div className="flex items-center justify-center mb-4 text-teal-400">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">For Patients</h3>
              <p className="text-muted-foreground">Never memorize your medical history again. Carry your health identity securely in your pocket.</p>
            </div>
            <div className="p-4 pt-12 md:pt-4">
              <div className="flex items-center justify-center mb-4 text-purple-400">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">For Institutions</h3>
              <p className="text-muted-foreground">Optimize workflows, reduce administrative overhead, and ensure strict compliance effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & CTA */}
      <section className="relative py-32 bg-card border-t border-border text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">Ready to modernize your healthcare infrastructure?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join the forward-thinking hospitals and clinics unifying the healthcare experience with AMC. HIPAA and GDPR compliant out of the box.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-primary-foreground hover:bg-slate-200 font-bold text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Get Started Now
            </a>
            <a href="#" className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-border text-foreground hover:bg-muted font-medium text-lg transition-all">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Activity className="w-5 h-5 text-emerald-500" />
            <span className="text-foreground font-semibold tracking-wide">AMC</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Security</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </main>
  );
}