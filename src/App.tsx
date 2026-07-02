import { useState } from "react";
import Auth from "./Auth";
import Chat from "./Chat";

interface User {
  id: string;
  email: string;
}

export default function App() {
  // ذخیره اطلاعات کاربر لاگین شده (اگر null باشه یعنی کاربر وارد نشده)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // تابع خروج از حساب کاربری
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // مدیریت نمایش صفحات بر اساس وضعیت لاگین
  return (
    <>
      {currentUser ? (
        <Chat currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <Auth onAuthSuccess={(user) => setCurrentUser(user)} />
      )}
    </>
  );
}