import React, { useState, useEffect, useRef } from "react";

interface User {
  id: string;
  email: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatProps {
  currentUser: User;
  onLogout: () => void;
}

export default function Chat({ currentUser, onLogout }: ChatProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://chat-backend.kunqh238.workers.dev/api/users")
      .then((res) => res.json())
      .then((data) => {
        const otherUsers = data.filter((u: User) => u.id !== currentUser.id);
        setUsers(otherUsers);
      })
      .catch((err) => console.error("خطا در دریافت کاربران:", err));
  }, [currentUser.id]);

  useEffect(() => {
    const ws = new WebSocket(`wss://chat-backend.kunqh238.workers.dev/api/ws?userId=${currentUser.id}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        const msg = data.message;
        if (selectedUser && (msg.sender_id === selectedUser.id || msg.receiver_id === selectedUser.id)) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [currentUser.id, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    fetch(`https://chat-backend.kunqh238.workers.dev/api/messages?sender_id=${currentUser.id}&receiver_id=${selectedUser.id}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("خطا در لود پیام‌ها:", err));
  }, [selectedUser, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
    };

    try {
      const response = await fetch("https://chat-backend.kunqh238.workers.dev/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const tempMsg: Message = {
          id: crypto.randomUUID(),
          sender_id: currentUser.id,
          receiver_id: selectedUser.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("خطا در ارسال پیام:", err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden" dir="rtl">
      {/* نئون‌های ملایم پس‌زمینه چت */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none" />
      
      {/* سایدبار شیشه‌ای آیفون */}
      <div className={`w-full md:w-85 flex flex-col border-l border-white/5 bg-slate-900/30 backdrop-blur-2xl z-10 ${selectedUser ? "hidden md:flex" : "flex"}`}>
        {/* هدر سایدبار */}
        <div className="p-4 bg-slate-900/50 backdrop-blur-md flex justify-between items-center border-b border-white/5">
          <div className="overflow-hidden">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">کاربر فعلی</p>
            <p className="font-semibold text-sm truncate text-blue-400 shadow-sm">{currentUser.email}</p>
          </div>
          <button onClick={onLogout} className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-medium px-3 py-2 rounded-xl border border-red-500/20 transition-all duration-300">
            خروج
          </button>
        </div>

        {/* لیست گفتگوها */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <p className="text-xs font-bold text-slate-500 px-2 py-1">گفتگوهای اخیر</p>
          {users.length === 0 ? (
            <p className="text-sm text-slate-600 text-center mt-6">کاربر دیگری یافت نشد.</p>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full text-right p-3.5 rounded-2xl flex items-center gap-3.5 transition-all duration-300 border ${selectedUser?.id === user.id ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]" : "bg-transparent hover:bg-white/5 border-transparent text-slate-300"}`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border ${selectedUser?.id === user.id ? "bg-white/20 border-white/20" : "bg-slate-800 border-white/5 text-slate-300"}`}>
                  {user.email.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 truncate">
                  <p className="font-semibold text-sm truncate">{user.email}</p>
                  <p className={`text-xs truncate ${selectedUser?.id === user.id ? "text-blue-100" : "text-slate-500"}`}>جهت شروع گفتگو کلیک کنید</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* باکس چت اصلی */}
      <div className={`flex-1 flex flex-col bg-transparent z-10 ${!selectedUser ? "hidden md:flex justify-center items-center text-slate-500" : "flex"}`}>
        {selectedUser ? (
          <>
            {/* هدر چت */}
            <div className="p-4 bg-slate-900/40 backdrop-blur-md border-b border-white/5 flex items-center gap-3">
              <button onClick={() => setSelectedUser(null)} className="md:hidden text-blue-400 font-semibold ml-2 text-sm transition hover:text-blue-300">
                ← بازگشت
              </button>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                {selectedUser.email.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-slate-200 truncate">{selectedUser.email}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <p className="text-[11px] font-medium text-emerald-400">اتصال امن فعال</p>
                </div>
              </div>
            </div>

            {/* بخش پیام‌ها */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser.id;
                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-xl break-words transition-all duration-300 border ${isMe ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/30 rounded-br-none shadow-[0_0_20px_rgba(37,99,235,0.2)]" : "bg-slate-900/80 text-slate-100 border-white/5 rounded-bl-none backdrop-blur-sm"}`}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <span className="block text-[9px] text-left opacity-40 mt-1.5 tracking-tighter">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* اینپوت شیک آیفونی ارسال پیام */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/30 backdrop-blur-md border-t border-white/5 flex gap-2.5">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 bg-slate-950/80 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
              />
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white font-semibold px-6 py-3.5 rounded-2xl text-sm transition-all duration-300 active:scale-95">
                ارسال
              </button>
            </form>
          </>
        ) : (
          <div className="text-center opacity-80">
            <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">💬</div>
            <p className="text-sm font-medium text-slate-400">یک گفتگو را از منوی سمت راست انتخاب کرده و چت را شروع کنید.</p>
          </div>
        )}
      </div>
    </div>
  );
}
