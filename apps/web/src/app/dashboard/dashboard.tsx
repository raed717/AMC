"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserQRCode from "@/components/user-qr-code";
import QRScanner from "@/components/qr-scanner";
import { User, Mail, Shield, Activity } from "lucide-react";

interface DashboardPageProps {
  role?: string;
}

export default function DashboardPage({ role }: DashboardPageProps) {
  const privateData = useQuery(trpc.privateData.queryOptions());
  const { data: session } = authClient.useSession();

  if (!session) return null;

  const user = session.user;
  const userRole = role || "patient";
  const isDoctor = userRole === "doctor";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400">Welcome back, {user.name}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2">
              <User className="h-5 w-5 text-teal-500" />
              <CardTitle className="text-slate-200 text-lg">Name</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{user.name}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2">
              <Mail className="h-5 w-5 text-teal-500" />
              <CardTitle className="text-slate-200 text-lg">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{user.email}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2">
              <Shield className="h-5 w-5 text-teal-500" />
              <CardTitle className="text-slate-200 text-lg">Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 capitalize">{userRole}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          {isDoctor ? (
            <QRScanner />
          ) : (
            <UserQRCode userId={user.id} />
          )}
        </div>
      </div>

      {privateData.data && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="h-5 w-5 text-teal-500" />
            <CardTitle className="text-slate-200">API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-teal-400">{privateData.data.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
