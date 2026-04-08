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
        <h1 className="text-3xl font-bold text-card-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-card-foreground text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="text-foreground text-lg">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="text-foreground text-lg">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-card-foreground text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <p className="text-foreground text-lg">User</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Account Created</label>
              <p className="text-foreground text-lg">{createdAt}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email Verified</label>
              <p className="text-foreground text-lg">{user.emailVerified ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {user.image && (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-card-foreground text-lg">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={user.image} 
              alt={user.name} 
              className="w-24 h-24 rounded-full border-2 border-border"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
