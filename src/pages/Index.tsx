import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "news" | "ads" | "phonebook" | "chat" | "profile";
type AdStatus = "pending" | "approved" | "rejected";

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
  pinned?: boolean;
}

interface Ad {
  id: number;
  title: string;
  text: string;
  author: string;
  date: string;
  category: string;
  status: AdStatus;
  phone?: string;
}

interface Contact {
  id: number;
  name: string;
  role: string;
  phone: string;
  department: string;
}

interface Message {
  id: number;
  author: string;
  text: string;
  time: string;
  mine: boolean;
  status?: "ok" | "flagged";
}

const NEWS: NewsItem[] = [
  { id: 1, title: "Плановое отключение воды 30 апреля", date: "27 апр 2026", category: "ЖКХ", text: "В связи с проведением плановых ремонтных работ 30 апреля с 09:00 до 17:00 будет отключена подача холодной воды по ул. Центральной и пер. Садовому. Приносим извинения за неудобства.", pinned: true },
  { id: 2, title: "Субботник 3 мая — приглашаем всех!", date: "25 апр 2026", category: "События", text: "Приглашаем всех жителей принять участие в общем субботнике. Встречаемся у администрации в 10:00. Инвентарь предоставляется." },
  { id: 3, title: "Новое расписание автобуса №14", date: "20 апр 2026", category: "Транспорт", text: "С 1 мая вводится новое расписание автобусного маршрута №14. Первый рейс в 06:15, последний в 22:30. Интервал в часы пик — 20 минут." },
  { id: 4, title: "Праздник посёлка — 15 июня", date: "18 апр 2026", category: "События", text: "В этом году день посёлка пройдёт 15 июня на центральной площади. В программе: концерт, ярмарка, спортивные соревнования и праздничный салют." },
];

const INITIAL_ADS: Ad[] = [
  { id: 1, title: "Продаю велосипед", text: "Горный велосипед, 2022 год, состояние хорошее. Цена 8 000 руб.", author: "Иван П.", date: "26 апр", category: "Продам", status: "approved", phone: "+7 912 345-67-89" },
  { id: 2, title: "Сдам огород в аренду", text: "Участок 4 сотки, вода рядом, хорошая земля. На сезон.", author: "Мария С.", date: "25 апр", category: "Недвижимость", status: "approved", phone: "+7 903 111-22-33" },
  { id: 3, title: "Куплю стройматериалы", text: "Куплю кирпич, блоки, доску б/у. Самовывоз.", author: "Олег К.", date: "24 апр", category: "Куплю", status: "pending" },
  { id: 4, title: "Ищу помощника по дому", text: "Требуется помощь по уборке 2 раза в неделю. Оплата по договорённости.", author: "Нина В.", date: "23 апр", category: "Услуги", status: "approved", phone: "+7 921 777-55-44" },
  { id: 5, title: "Нарушение тишины на ул. Лесной", text: "Соседи шумят по ночам каждый день. Уже 3-я неделя.", author: "Анон.", date: "22 апр", category: "Жалоба", status: "rejected" },
];

const CONTACTS: Contact[] = [
  { id: 1, name: "Администрация посёлка", role: "Приёмная", phone: "8 (383) 123-45-67", department: "Власть" },
  { id: 2, name: "Смирнов А. В.", role: "Глава администрации", phone: "8 (383) 123-45-68", department: "Власть" },
  { id: 3, name: "Скорая помощь", role: "Круглосуточно", phone: "103", department: "Экстренные" },
  { id: 4, name: "Пожарная служба", role: "Круглосуточно", phone: "101", department: "Экстренные" },
  { id: 5, name: "Полиция", role: "Дежурная часть", phone: "102", department: "Экстренные" },
  { id: 6, name: "Управляющая компания", role: "ЖКХ, аварии", phone: "8 (383) 234-56-78", department: "ЖКХ" },
  { id: 7, name: "Котельная", role: "Теплоснабжение", phone: "8 (383) 234-56-79", department: "ЖКХ" },
  { id: 8, name: "Амбулатория", role: "Пн–Пт 08:00–17:00", phone: "8 (383) 345-67-89", department: "Медицина" },
  { id: 9, name: "Детский сад №3", role: "Заведующая Козлова Е.И.", phone: "8 (383) 456-78-90", department: "Образование" },
  { id: 10, name: "Школа №1", role: "Директор Петрова М.А.", phone: "8 (383) 456-78-91", department: "Образование" },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 1, author: "Администрация", text: "Напоминаем о субботнике 3 мая!", time: "10:02", mine: false },
  { id: 2, author: "Иван П.", text: "Подскажите, когда откроют детскую площадку на Садовой?", time: "10:15", mine: false },
  { id: 3, author: "Вы", text: "Слышал, что в мае планируют. Надо у администрации уточнить.", time: "10:18", mine: true },
  { id: 4, author: "Мария С.", text: "Да, точно в мае. Уже завезли качели :)", time: "10:20", mine: false },
  { id: 5, author: "Анон.", text: "купите у меня хлам дёшево !!!!", time: "10:22", mine: false, status: "flagged" },
  { id: 6, author: "Олег К.", text: "Кто знает номер аварийной службы воды?", time: "11:05", mine: false },
];

const categoryColor: Record<string, string> = {
  "ЖКХ": "bg-blue-100 text-blue-700",
  "События": "bg-emerald-100 text-emerald-700",
  "Транспорт": "bg-amber-100 text-amber-700",
  "Продам": "bg-violet-100 text-violet-700",
  "Куплю": "bg-sky-100 text-sky-700",
  "Недвижимость": "bg-teal-100 text-teal-700",
  "Услуги": "bg-orange-100 text-orange-700",
  "Жалоба": "bg-red-100 text-red-700",
};

const deptBorderColor: Record<string, string> = {
  "Экстренные": "border-l-red-500",
  "ЖКХ": "border-l-blue-500",
  "Власть": "border-l-slate-500",
  "Медицина": "border-l-green-500",
  "Образование": "border-l-amber-500",
};

const statusLabel: Record<AdStatus, { label: string; color: string }> = {
  pending: { label: "На проверке", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Опубликовано", color: "bg-green-100 text-green-700" },
  rejected: { label: "Отклонено", color: "bg-red-100 text-red-700" },
};

export default function Index() {
  const [tab, setTab] = useState<Tab>("news");
  const [newsOpen, setNewsOpen] = useState<number | null>(null);
  const [adFilter, setAdFilter] = useState<string>("Все");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [ads, setAds] = useState<Ad[]>(INITIAL_ADS);
  const [profileMyAdsOpen, setProfileMyAdsOpen] = useState(false);
  const [showNewAd, setShowNewAd] = useState(false);
  const [newAd, setNewAd] = useState({ title: "", text: "", category: "Продам", phone: "" });

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: "news", icon: "Newspaper", label: "Новости" },
    { id: "ads", icon: "Tag", label: "Объявления" },
    { id: "phonebook", icon: "Phone", label: "Телефоны" },
    { id: "chat", icon: "MessageCircle", label: "Чат" },
    { id: "profile", icon: "User", label: "Кабинет" },
  ];

  const adCategories = ["Все", "Продам", "Куплю", "Недвижимость", "Услуги"];
  const filteredAds = adFilter === "Все"
    ? ads.filter(a => a.status === "approved")
    : ads.filter(a => a.status === "approved" && a.category === adFilter);

  const filteredContacts = CONTACTS.filter(c =>
    phoneSearch === "" ||
    c.name.toLowerCase().includes(phoneSearch.toLowerCase()) ||
    c.role.toLowerCase().includes(phoneSearch.toLowerCase()) ||
    c.department.toLowerCase().includes(phoneSearch.toLowerCase())
  );
  const contactGroups = filteredContacts.reduce<Record<string, Contact[]>>((acc, c) => {
    if (!acc[c.department]) acc[c.department] = [];
    acc[c.department].push(c);
    return acc;
  }, {});

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      author: "Вы",
      text: chatInput,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      mine: true,
    }]);
    setChatInput("");
  };

  const submitAd = () => {
    if (!newAd.title.trim() || !newAd.text.trim()) return;
    setAds(prev => [{
      id: prev.length + 1,
      title: newAd.title,
      text: newAd.text,
      author: "Вы",
      date: "Сегодня",
      category: newAd.category,
      status: "pending",
      phone: newAd.phone || undefined,
    }, ...prev]);
    setNewAd({ title: "", text: "", category: "Продам", phone: "" });
    setShowNewAd(false);
  };

  const pendingAds = ads.filter(a => a.status === "pending");
  const myAds = ads.filter(a => a.author === "Вы");

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Icon name="TreePine" size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Субботино</p>
              <p className="text-white/60 text-xs">Портал жителей</p>
            </div>
          </div>
          <button className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Icon name="Bell" size={18} className="text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border border-primary" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">

        {/* ── НОВОСТИ ── */}
        {tab === "news" && (
          <div className="animate-fade-in">
            <div className="px-4 pt-5 pb-3">
              <h2 className="text-xl font-bold text-foreground">Новости посёлка</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Актуальные события и объявления</p>
            </div>
            <div className="px-4 space-y-3 pb-4">
              {NEWS.map((item, i) => (
                <div
                  key={item.id}
                  className={`bg-card rounded-xl border border-border overflow-hidden cursor-pointer active:scale-[0.99] transition-transform animate-slide-up`}
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: "forwards" }}
                  onClick={() => setNewsOpen(newsOpen === item.id ? null : item.id)}
                >
                  {item.pinned && (
                    <div className="bg-primary/8 border-b border-primary/15 px-4 py-1.5 flex items-center gap-1.5">
                      <Icon name="Pin" size={12} className="text-primary" />
                      <span className="text-xs font-medium text-primary">Закреплено</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor[item.category] || "bg-gray-100 text-gray-600"}`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{item.date}</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-[15px] leading-snug">{item.title}</h3>
                    {newsOpen === item.id && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed animate-fade-in">{item.text}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-primary text-xs font-medium">
                      <Icon name={newsOpen === item.id ? "ChevronUp" : "ChevronDown"} size={14} />
                      {newsOpen === item.id ? "Свернуть" : "Читать"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ОБЪЯВЛЕНИЯ ── */}
        {tab === "ads" && (
          <div className="animate-fade-in">
            <div className="px-4 pt-5 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Объявления</h2>
                <p className="text-muted-foreground text-sm mt-0.5">Жители посёлка</p>
              </div>
              <button
                onClick={() => setShowNewAd(true)}
                className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-3 py-2 rounded-lg active:opacity-80 transition-opacity"
              >
                <Icon name="Plus" size={16} />
                Подать
              </button>
            </div>
            <div className="flex gap-2 px-4 overflow-x-auto pb-2 pt-1" style={{ scrollbarWidth: "none" }}>
              {adCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setAdFilter(cat)}
                  className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full border transition-colors font-medium ${adFilter === cat ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="px-4 mt-2 space-y-3 pb-4">
              {filteredAds.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Tag" size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Нет объявлений в этой категории</p>
                </div>
              )}
              {filteredAds.map((ad, i) => (
                <div
                  key={ad.id}
                  className="bg-card rounded-xl border border-border p-4 animate-slide-up"
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: "forwards" }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor[ad.category] || "bg-gray-100 text-gray-600"}`}>{ad.category}</span>
                    <span className="text-xs text-muted-foreground">{ad.date}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-[15px]">{ad.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{ad.text}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon name="User" size={13} />
                      <span>{ad.author}</span>
                    </div>
                    {ad.phone && (
                      <a href={`tel:${ad.phone}`} className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                        <Icon name="Phone" size={13} />
                        {ad.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ТЕЛЕФОННАЯ КНИГА ── */}
        {tab === "phonebook" && (
          <div className="animate-fade-in">
            <div className="px-4 pt-5 pb-3">
              <h2 className="text-xl font-bold text-foreground">Телефонная книга</h2>
              <div className="mt-3 relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={phoneSearch}
                  onChange={e => setPhoneSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="px-4 pb-4 space-y-5">
              {Object.entries(contactGroups).map(([dept, contacts]) => (
                <div key={dept}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{dept}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-2">
                    {contacts.map(c => (
                      <div key={c.id} className={`bg-card rounded-xl border border-border border-l-4 ${deptBorderColor[c.department] || "border-l-gray-300"} p-3.5 flex items-center justify-between`}>
                        <div>
                          <p className="font-semibold text-foreground text-sm leading-snug">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.role}</p>
                        </div>
                        <a href={`tel:${c.phone}`} className="ml-3 shrink-0 flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-2 rounded-lg active:opacity-80">
                          <Icon name="Phone" size={14} />
                          <span>{c.phone}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ЧАТ ── */}
        {tab === "chat" && (
          <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 7.5rem)" }}>
            <div className="px-4 pt-5 pb-3 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Общий чат</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{messages.length} сообщений</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">24 онлайн</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <Icon name="Shield" size={14} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700">Сообщения проверяются модератором</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}>
                  {msg.status === "flagged" ? (
                    <div className="max-w-[82%] bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-1.5">
                          <Icon name="AlertTriangle" size={13} className="text-red-500" />
                          <span className="text-xs font-semibold text-red-600">Подозрительное</span>
                        </div>
                        <button
                          onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                          className="text-xs text-red-500 font-semibold underline"
                        >
                          Удалить
                        </button>
                      </div>
                      <p className="text-xs text-red-400 line-through">{msg.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">от {msg.author} · {msg.time}</p>
                    </div>
                  ) : (
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${msg.mine ? "bg-primary text-white" : "bg-card border border-border text-foreground"}`}>
                      {!msg.mine && <p className="text-xs font-semibold mb-0.5 opacity-60">{msg.author}</p>}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[11px] mt-1 text-right ${msg.mine ? "text-white/50" : "text-muted-foreground"}`}>{msg.time}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-border bg-background shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Написать сообщение..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 active:opacity-80 transition-opacity"
                >
                  <Icon name="Send" size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ЛИЧНЫЙ КАБИНЕТ ── */}
        {tab === "profile" && (
          <div className="animate-fade-in">
            <div className="bg-primary px-4 pt-6 pb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Icon name="User" size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">Алексей Иванов</h2>
                  <p className="text-white/70 text-sm mt-0.5">ул. Центральная, д. 14</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-white/60 text-xs">Житель · с 2021 года</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 -mt-3 space-y-3 pb-6">

              {/* Мои объявления */}
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <button
                  onClick={() => setProfileMyAdsOpen(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Icon name="Tag" size={18} className="text-violet-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-foreground">Мои объявления</p>
                      <p className="text-xs text-muted-foreground">{myAds.length} объявлений</p>
                    </div>
                  </div>
                  <Icon name={profileMyAdsOpen ? "ChevronUp" : "ChevronRight"} size={18} className="text-muted-foreground" />
                </button>
                {profileMyAdsOpen && (
                  <div className="border-t border-border px-4 py-3 space-y-2 animate-fade-in">
                    {myAds.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-3">Пока нет объявлений</p>
                    )}
                    {myAds.map(ad => (
                      <div key={ad.id} className="flex items-center justify-between py-2">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                          <p className="text-xs text-muted-foreground">{ad.date}</p>
                        </div>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusLabel[ad.status].color}`}>
                          {statusLabel[ad.status].label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Уведомления */}
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon name="Bell" size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Уведомления</p>
                      <p className="text-xs text-muted-foreground">3 непрочитанных</p>
                    </div>
                  </div>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
                </div>
              </div>

              {/* Настройки */}
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Icon name="Settings" size={18} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Настройки профиля</p>
                      <p className="text-xs text-muted-foreground">Имя, адрес, телефон</p>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
                </div>
              </div>

              {/* Панель модератора */}
              <div className={`rounded-xl border overflow-hidden shadow-sm ${pendingAds.length > 0 ? "bg-amber-50 border-amber-200" : "bg-card border-border"}`}>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Icon name="Shield" size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Панель модератора</p>
                      <p className="text-xs text-muted-foreground">
                        {pendingAds.length > 0 ? `${pendingAds.length} объявления ждут проверки` : "Нет ожидающих проверки"}
                      </p>
                    </div>
                  </div>
                  {pendingAds.length > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingAds.length}</span>
                  )}
                </div>

                {pendingAds.length > 0 && (
                  <div className="border-t border-amber-200 px-4 py-3 space-y-2">
                    {pendingAds.map(ad => (
                      <div key={ad.id} className="bg-white rounded-lg border border-amber-200 p-3">
                        <p className="text-sm font-semibold text-foreground">{ad.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ad.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">от {ad.author} · {ad.date}</p>
                        <div className="flex gap-2 mt-2.5">
                          <button
                            onClick={() => setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: "approved" } : a))}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold py-2 rounded-lg active:opacity-80"
                          >
                            <Icon name="Check" size={14} /> Одобрить
                          </button>
                          <button
                            onClick={() => setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: "rejected" } : a))}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-100 text-red-700 text-xs font-semibold py-2 rounded-lg active:opacity-80"
                          >
                            <Icon name="X" size={14} /> Отклонить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border-t border-border z-50">
        <div className="flex items-stretch">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${tab === item.id ? "text-primary" : "text-muted-foreground"}`}
            >
              <div className={`relative p-1.5 rounded-xl transition-colors ${tab === item.id ? "bg-primary/10" : ""}`}>
                <Icon name={item.icon} size={20} />
                {item.id === "chat" && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
                {item.id === "profile" && pendingAds.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] ${tab === item.id ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modal: Новое объявление */}
      {showNewAd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => setShowNewAd(false)}>
          <div
            className="w-full max-w-lg bg-card rounded-t-2xl p-5 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground">Новое объявление</h3>
              <button onClick={() => setShowNewAd(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Заголовок</label>
                <input
                  type="text"
                  placeholder="Коротко о главном..."
                  value={newAd.title}
                  onChange={e => setNewAd(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Описание</label>
                <textarea
                  rows={3}
                  placeholder="Подробности..."
                  value={newAd.text}
                  onChange={e => setNewAd(p => ({ ...p, text: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Категория</label>
                  <select
                    value={newAd.category}
                    onChange={e => setNewAd(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {["Продам", "Куплю", "Недвижимость", "Услуги"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Телефон</label>
                  <input
                    type="tel"
                    placeholder="+7 ..."
                    value={newAd.phone}
                    onChange={e => setNewAd(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <Icon name="Info" size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Объявление будет опубликовано после проверки модератором</p>
              </div>
              <button
                onClick={submitAd}
                disabled={!newAd.title.trim() || !newAd.text.trim()}
                className="w-full bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-40 active:opacity-80 transition-opacity"
              >
                Отправить на проверку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
