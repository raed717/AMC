"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QRScanner() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [manualId, setManualId] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [containerId] = useState(() => `qr-reader-${Math.random().toString(36).slice(2, 11)}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppedRef = useRef(false);

  const startScanner = async () => {
    try {
      setError("");
      setIsStarting(true);
      isStoppedRef.current = false;
      
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          console.log("QR Code detected:", decodedText);
          isStoppedRef.current = true;
          
          try {
            scanner.stop();
          } catch (e) {
            // Ignore - scanner may have already stopped
          }
          
          setIsScanning(false);
          router.push(`/dashboard/patient/${encodeURIComponent(decodedText)}` as any);
        },
        (errorMessage) => {
          // QR code not in frame - this is normal, ignore
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err: any) {
      console.error("Scanner error:", err);
      if (err.toString().includes("Permission denied") || err.toString().includes("NotAllowedError")) {
        setError("Camera permission denied. Please allow camera access in your browser settings.");
        setHasPermission(false);
      } else if (err.toString().includes("NotFoundError") || err.toString().includes("not found")) {
        setError("No camera found on this device.");
      } else {
        setError("Failed to start camera: " + err.message);
      }
    } finally {
      setIsStarting(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && !isStoppedRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        // Ignore - scanner may have already stopped
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      router.push(`/dashboard/patient/${encodeURIComponent(manualId.trim())}` as any);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && !isStoppedRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center gap-2">
        <Camera className="h-5 w-5 text-emerald-500" />
        <CardTitle className="text-card-foreground text-lg">Scan Patient QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          id={containerId} 
          className="w-full rounded-lg overflow-hidden bg-black min-h-[250px]"
        />

        {!isScanning && (
          <div className="space-y-4 -mt-4">
            {hasPermission === false && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Camera access denied</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={startScanner}
              disabled={isStarting}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              <Camera className="w-4 h-4 mr-2" />
              {isStarting ? "Starting..." : "Start Scanner"}
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Point camera at QR code...</span>
            </div>

            <Button
              onClick={stopScanner}
              variant="outline"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Stop Scanner
            </Button>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center mb-3">Or enter patient ID manually</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter patient ID"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="bg-muted border-border text-card-foreground"
            />
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
              Go
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Position the patient's QR code within the camera frame to scan
        </p>
      </CardContent>
    </Card>
  );
}
