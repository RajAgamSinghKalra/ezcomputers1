"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SetupState {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
}

type ActiveAction = "disable" | "regenerate" | null;

export function TwoFactorManager({ enabled: initialEnabled }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [setupState, setSetupState] = useState<SetupState | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [actionCode, setActionCode] = useState("");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSetup = async () => {
    setError(null);
    setRecoveryCodes(null);
    setVerificationCode("");
    setIsProcessing(true);
    try {
      const res = await fetch("/api/account/two-factor/initiate", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to start setup");
      }
      const data = await res.json();
      setSetupState(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to start two-factor setup");
    } finally {
      setIsProcessing(false);
    }
  };

  const completeSetup = async () => {
    if (!setupState) return;
    setError(null);
    setIsProcessing(true);
    try {
      const res = await fetch("/api/account/two-factor/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: setupState.secret, code: verificationCode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to enable two-factor");
      }
      const data = await res.json();
      setRecoveryCodes(data.recoveryCodes ?? []);
      setSetupState(null);
      setVerificationCode("");
      setEnabled(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to enable two-factor");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisable = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const res = await fetch("/api/account/two-factor/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: actionCode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to disable two-factor");
      }
      setEnabled(false);
      setRecoveryCodes(null);
      setSetupState(null);
      setActiveAction(null);
      setActionCode("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to disable two-factor");
    } finally {
      setIsProcessing(false);
    }
  };

  const regenerateCodes = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const res = await fetch("/api/account/two-factor/recovery-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: actionCode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to regenerate codes");
      }
      const data = await res.json();
      setRecoveryCodes(data.recoveryCodes ?? []);
      setActiveAction(null);
      setActionCode("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to regenerate codes");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Two-factor authentication</h2>
            <p className="text-sm text-foreground-muted">
              Protect your account with a rotating verification code powered by your authenticator app. We recommend enabling this before storing payment details or saved builds.
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Status: {enabled ? <span className="text-emerald-500">Enabled</span> : <span className="text-foreground">Disabled</span>}
            </p>
          </div>
          {!enabled ? (
            <Button onClick={startSetup} disabled={isProcessing}>
              {setupState ? "Restart setup" : "Enable two-factor"}
            </Button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" disabled={isProcessing} onClick={() => setActiveAction("regenerate")}>Regenerate backup codes</Button>
              <Button variant="destructive" disabled={isProcessing} onClick={() => setActiveAction("disable")}>Disable</Button>
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {setupState && (
          <div className="mt-6 grid gap-4 md:grid-cols-[280px_1fr] md:items-center">
            <div className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-border-soft bg-background p-4">
              <Image src={setupState.qrCode} alt="QR code for authenticator app" width={192} height={192} className="h-48 w-48" unoptimized />
              <p className="text-xs text-foreground-muted break-all">{setupState.secret}</p>
            </div>
            <div className="space-y-3 text-sm text-foreground-muted">
              <p>Scan the QR code with your authenticator app (Google Authenticator, 1Password, Authy, etc.).</p>
              <p>Enter the 6-digit code below to confirm.</p>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="two-factor-code">
                  Verification code
                </label>
                <input
                  id="two-factor-code"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                  className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                  disabled={isProcessing}
                />
              </div>
              <Button onClick={completeSetup} disabled={isProcessing || verificationCode.length < 6}>
                Confirm & enable
              </Button>
            </div>
          </div>
        )}
      </div>

      {activeAction && (
        <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {activeAction === "disable" ? "Disable two-factor" : "Generate new recovery codes"}
              </h3>
              <p className="text-xs text-foreground-muted">
                Enter a current authentication code or one of your backup codes to continue.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setActiveAction(null); setActionCode(""); }} disabled={isProcessing}>
              Cancel
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={actionCode}
              onChange={(event) => setActionCode(event.target.value)}
              placeholder="123456"
              className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              disabled={isProcessing}
            />
            <div className="flex justify-end gap-2">
              {activeAction === "regenerate" ? (
                <Button onClick={regenerateCodes} disabled={isProcessing || actionCode.length < 6}>
                  Generate codes
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleDisable} disabled={isProcessing || actionCode.length < 6}>
                  Disable two-factor
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {recoveryCodes && recoveryCodes.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-brand-500/50 bg-brand-500/5 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-brand-600">Backup codes generated</h3>
          <p className="mt-2 text-xs text-foreground-muted">
            Store these codes in a safe place. Each code can be used once if you lose access to your authenticator app.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {recoveryCodes.map((code) => (
              <code key={code} className="rounded-[var(--radius-md)] bg-background px-3 py-2 text-sm text-foreground">{code}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}




