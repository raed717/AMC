import { auth } from "@AMC/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import DashboardNavbar from "@/components/dashboard-navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
