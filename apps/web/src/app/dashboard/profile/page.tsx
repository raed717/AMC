"use client";

import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Calendar, Clock } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();

  if (!session) return null;

  const user = session.user;
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Profile</h1>
        <p className="text-slate-400">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="h-5 w-5 text-teal-500" />
            <CardTitle className="text-slate-200 text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Name</label>
              <p className="text-slate-300 text-lg">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Email</label>
              <p className="text-slate-300 text-lg">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="h-5 w-5 text-teal-500" />
            <CardTitle className="text-slate-200 text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Role</label>
              <p className="text-slate-300 text-lg">User</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Account Created</label>
              <p className="text-slate-300 text-lg">{createdAt}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Email Verified</label>
              <p className="text-slate-300 text-lg">{user.emailVerified ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {user.image && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-500" />
            <CardTitle className="text-slate-200 text-lg">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={user.image} 
              alt={user.name} 
              className="w-24 h-24 rounded-full border-2 border-slate-700"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
