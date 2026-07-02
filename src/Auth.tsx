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
      // اتصال به بک‌آند جدید و واقعی رندر
      const response = await fetch(`https://minichat-backend-gcao.onrender.com${endpoint}`, {
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white font-sans relative overflow-hidden" dir="rtl">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="w-full max-w-md rounded-3xl bg-slate-900/40 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(37,99,235,0.15)] border border-white/10 z-10">
        <div className="mb-8 text-center">
          <div className="inline-block rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-4 text-3xl shadow-[0_0_20px_rgba(37,99,235,0.5)]">
            💬
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {isLogin ? "ورود به مینی‌تلگرام" : "ساخت حساب کاربری"}
          </h2>
          <p className="mt-1.5 text-sm text-slate-400">لطفاً اطلاعات خود را وارد کنید.</p>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-500/10 backdrop-blur-sm p-3.5 text-sm text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">{error}</div>}
        {message && <div className="mb-4 rounded-xl bg-emerald-500/10 backdrop-blur-sm p-3.5 text-sm text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase pr-1">ایمیل</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-950/60 border border-white/5 p-3.5 text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase pr-1">رمز عبور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-950/60 border border-white/5 p-3.5 text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3.5 font-semibold text-white transition-all duration-300 hover:opacity-95 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-[0.98]"
          >
            {isLogin ? "ورود" : "ثبت‌نام"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => { setIsLogin(!isLogin); setError(""); setMessage(""); }} className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
            {isLogin ? "هنوز حساب ندارید؟ ثبت‌نام کنید" : "قبلاً حساب ساخته‌اید؟ وارد شوید"}
          </button>
        </div>
      </div>
    </div>
  );
}
