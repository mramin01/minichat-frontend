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
    // استفاده از wss برای اتصال امن روی اینترنت واقعی
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
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      <div className={`w-full md:w-80 flex flex-col border-l border-slate-800 bg-slate-900 ${selectedUser ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
          <div className="overflow-hidden">
            <p className="text-xs text-slate-400">کاربر فعلی:</p>
            <p className="font-semibold text-sm truncate text-blue-400">{currentUser.email}</p>
          </div>
          <button onClick={onLogout} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs px-2 py-1.5 rounded-lg transition">
            خروج
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-xs text-slate-500 px-3 py-2">گفتگوها</p>
          {users.length === 0 ? (
            <p className="text-sm text-slate-500 text-center mt-4">کاربر دیگری یافت نشد.</p>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full text-right p-3 rounded-xl flex items-center gap-3 transition ${selectedUser?.id === user.id ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-300"}`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm border border-slate-600">
                  {user.email.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 truncate">
                  <p className="font-medium text-sm truncate">{user.email}</p>
                  <p className="text-xs opacity-60 truncate">برای چت کلیک کنید...</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-slate-950 ${!selectedUser ? "hidden md:flex justify-center items-center text-slate-500" : "flex"}`}>
        {selectedUser ? (
          <>
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
              <button onClick={() => setSelectedUser(null)} className="md:hidden text-blue-400 font-bold ml-2">← بازگشت</button>
              <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                {selectedUser.email.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-sm text-slate-200 truncate">{selectedUser.email}</h3>
                <p className="text-xs text-emerald-400">اتصال زنده فعال</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser.id;
                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl p-3 text-sm shadow-md break-words ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-800 text-slate-100 rounded-bl-none"}`}>
                      <p>{msg.content}</p>
                      <span className="block text-[10px] text-right opacity-50 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition">ارسال</button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-sm">یک کاربر را از منوی سمت راست انتخاب کن داداش و چت رو شروع کن!</p>
          </div>
        )}
      </div>
    </div>
  );
}