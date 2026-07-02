import React, { useState } from "react";

interface AuthProps {
  onAuthSuccess: (user: { id: string; email: string }) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const endpoint = isLogin ? "/api/login" : "/api/register";
    
    try {
      // اتصال مستقیم به بک‌آند واقعی کلودفلر
      const response = await fetch(`https://chat-backend.kunqh238.workers.dev${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطایی رخ داد");
      }

      if (isLogin) {
        onAuthSuccess(data.user);
      } else {
        setMessage("ثبت‌نام با موفقیت انجام شد! حالا می‌توانید وارد شوید.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-white font-sans" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        <div className="mb-6 text-center">
          <div className="inline-block rounded-full bg-blue-600 p-4 text-3xl">💬</div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            {isLogin ? "ورود به مینی‌تلگرام" : "ساخت حساب کاربری"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">خوش آمدی داداش! اطلاعاتت رو وارد کن.</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400 border border-red-500/30">{error}</div>}
        {message && <div className="mb-4 rounded-lg bg-emerald-500/20 p-3 text-sm text-emerald-400 border border-emerald-500/30">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">ایمیل</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-left"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">رمز عبور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-left"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500"
          >
            {isLogin ? "ورود" : "ثبت‌نام"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => { setIsLogin(!isLogin); setError(""); setMessage(""); }} className="text-blue-400 hover:underline">
            {isLogin ? "هنوز حساب نداری؟ ثبت‌نام کن" : "قبلاً حساب ساختی？ وارد شو"}
          </button>
        </div>
      </div>
    </div>
  );
}