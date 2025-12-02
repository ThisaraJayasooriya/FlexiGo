"use client";
import React, { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Toast from "./ui/Toast";

type Props = {
  mode: "register" | "login";
  role?: "worker" | "business";
  onSuccess?: (data: any) => void;
};

export default function AuthForm({ mode, role, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    try {
      const body: any = { email, password };
      if (mode === "register") body.role = role;
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      
      setToast({
        type: "success",
        message: mode === "register" ? "Account created successfully!" : "Signed in successfully!",
      });
      
      // Delay navigation to show success message
      setTimeout(() => {
        onSuccess?.(json);
      }, 1000);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <Input 
            placeholder="your.email@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <Input 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type="password" 
            required 
          />
        </div>
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Please wait...
            </span>
          ) : (
            mode === "register" ? "Create Account" : "Sign In"
          )}
        </Button>
      </form>
    </>
  );
}
