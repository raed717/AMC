"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode as QrCodeIcon, Copy, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserQRCode({ userId }: { userId: string }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(userId, {
          width: 250,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Error generating QR code:", err);
      } finally {
        setIsGenerating(false);
      }
    };

    generateQRCode();
  }, [userId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `amc-qr-${userId}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  if (isGenerating) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center gap-2">
          <QrCodeIcon className="h-5 w-5 text-emerald-500" />
          <CardTitle className="text-card-foreground text-lg">Your Medical ID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-[250px] h-[250px] bg-muted animate-pulse rounded-lg mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <QrCodeIcon className="h-5 w-5 text-emerald-500" />
          <CardTitle className="text-card-foreground text-lg">Your Medical ID</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-xl mx-auto w-fit">
          <img src={qrCodeUrl} alt="Medical QR Code" className="w-[200px] h-[200px]" />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Patient ID</p>
          <p className="text-foreground font-mono text-sm">{userId}</p>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted-foreground/20 text-card-foreground rounded-lg text-sm transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy ID
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-foreground rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Show this QR code to healthcare providers to access your medical records
        </p>
      </CardContent>
    </Card>
  );
}
