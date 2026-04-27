import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type Tab = "news" | "ads" | "phonebook" | "chat" | "profile";
type AdStatus = "pending" | "approved" | "rejected";
type AccentColor = "blue" | "green" | "red" | "violet" | "amber" | "teal";

interface NewsComment {
  id: number;
  author: string;
  text: string;
  time: string;
}

interface NewsReactions {
  likes: number;
  dislikes: number;
  myVote: "like" | "dislike" | null;
}

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
  pinned?: boolean;
  isNew?: boolean;
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
  isNew?: boolean;
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
  isNew?: boolean;
}

const ACCENT_COLORS: Record<AccentColor, { label: string; hsl: string; dot: string }> = {
  blue:   { label: "Синий",    hsl: "215 80% 32%",  dot: "bg-blue-600" },
  green:  { label: "Зелёный",  hsl: "145 60% 30%",  dot: "bg-green-600" },
  red:    { label: "Красный",  hsl: "0 72% 40%",    dot: "bg-red-600" },
  violet: { label: "Фиолетовый", hsl: "262 60% 40%", dot: "bg-violet-600" },
  amber:  { label: "Янтарный", hsl: "38 90% 38%",   dot: "bg-amber-500" },
  teal:   { label: "Бирюзовый", hsl: "175 60% 32%", dot: "bg-teal-600" },
};

const DARK_ACCENT: Record<AccentColor, string> = {
  blue:   "215 75% 55%",
  green:  "145 55% 48%",
  red:    "0 70% 58%",
  violet: "262 65% 62%",
  amber:  "38 85% 52%",
  teal:   "175 58% 48%",
};

const NEWS_POOL: NewsItem[] = [
  { id: 1, title: "Плановое отключение воды 30 апреля", date: "27 апр", category: "ЖКХ", text: "В связи с проведением плановых ремонтных работ 30 апреля с 09:00 до 17:00 будет отключена подача холодной воды по ул. Центральной и пер. Садовому.", pinned: true },
  { id: 2, title: "Субботник 3 мая — приглашаем всех!", date: "25 апр", category: "События", text: "Приглашаем всех жителей принять участие в общем субботнике. Встречаемся у администрации в 10:00." },
  { id: 3, title: "Новое расписание автобуса №14", date: "20 апр", category: "Транспорт", text: "С 1 мая вводится новое расписание маршрута №14. Первый рейс 06:15, последний 22:30." },
  { id: 4, title: "Праздник посёлка — 15 июня", date: "18 апр", category: "События", text: "В этом году день посёлка пройдёт 15 июня на центральной площади. Концерт, ярмарка, салют." },
];

const LIVE_NEWS: NewsItem[] = [
  { id: 100, title: "Установлены новые фонари на ул. Лесной", date: "Только что", category: "Благоустройство", text: "Завершены работы по установке 12 новых LED-фонарей на ул. Лесной. Улица теперь освещена до конца." },
  { id: 101, title: "Открытие новой аптеки в центре", date: "Только что", category: "Торговля", text: "В здании бывшего магазина «Берёзка» открылась аптека «Здоровье». Работает ежедневно 08:00–21:00." },
  { id: 102, title: "Ремонт дороги на ул. Садовой завершён", date: "Только что", category: "Транспорт", text: "Ямочный ремонт на ул. Садовой выполнен полностью. Дорога открыта для движения." },
];

const INITIAL_ADS: Ad[] = [
  { id: 1, title: "Продаю велосипед", text: "Горный велосипед, 2022 год, состояние хорошее. Цена 8 000 руб.", author: "Иван П.", date: "26 апр", category: "Продам", status: "approved", phone: "+7 912 345-67-89" },
  { id: 2, title: "Сдам огород в аренду", text: "Участок 4 сотки, вода рядом, хорошая земля. На сезон.", author: "Мария С.", date: "25 апр", category: "Недвижимость", status: "approved", phone: "+7 903 111-22-33" },
  { id: 3, title: "Куплю стройматериалы", text: "Куплю кирпич, блоки, доску б/у. Самовывоз.", author: "Олег К.", date: "24 апр", category: "Куплю", status: "pending" },
  { id: 4, title: "Ищу помощника по дому", text: "Требуется помощь по уборке 2 раза в неделю.", author: "Нина В.", date: "23 апр", category: "Услуги", status: "approved", phone: "+7 921 777-55-44" },
];

const LIVE_ADS: Ad[] = [
  { id: 200, title: "Продаю самокат детский", text: "Самокат для детей 5–8 лет, почти новый. 2 500 руб.", author: "Светлана К.", date: "Только что", category: "Продам", status: "approved", phone: "+7 913 000-11-22" },
  { id: 201, title: "Предлагаю услуги сантехника", text: "Устраняю протечки, меняю краны и трубы. Быстро и качественно.", author: "Дмитрий Р.", date: "Только что", category: "Услуги", status: "approved", phone: "+7 952 333-44-55" },
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
  { id: 2, author: "Иван П.", text: "Когда откроют детскую площадку на Садовой?", time: "10:15", mine: false },
  { id: 3, author: "Вы", text: "Слышал, что в мае. Надо у администрации уточнить.", time: "10:18", mine: true },
  { id: 4, author: "Мария С.", text: "Да, точно в мае. Уже завезли качели :)", time: "10:20", mine: false },
  { id: 5, author: "Анон.", text: "купите у меня хлам дёшево !!!!", time: "10:22", mine: false, status: "flagged" },
  { id: 6, author: "Олег К.", text: "Кто знает номер аварийной службы воды?", time: "11:05", mine: false },
];

const LIVE_MESSAGES = [
  { author: "Татьяна В.", text: "Всем привет! Кто-нибудь видел потерявшегося рыжего кота?" },
  { author: "Администрация", text: "Внимание: завтра плановое отключение света с 14:00 до 16:00." },
  { author: "Павел М.", text: "Продаю излишки картофеля со своего огорода, 30 руб/кг" },
  { author: "Елена Д.", text: "Спасибо за отремонтированную дорогу на Садовой, наконец-то!" },
  { author: "Сергей Н.", text: "Завтра на остановке у школы пропало расписание автобуса" },
];

const categoryColor: Record<string, string> = {
  "ЖКХ": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "События": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "Транспорт": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "Продам": "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "Куплю": "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  "Недвижимость": "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  "Услуги": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Жалоба": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  "Благоустройство": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Торговля": "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
};

const deptBorderColor: Record<string, string> = {
  "Экстренные": "border-l-red-500",
  "ЖКХ": "border-l-blue-500",
  "Власть": "border-l-slate-500",
  "Медицина": "border-l-green-500",
  "Образование": "border-l-amber-500",
};

const statusLabel: Record<AdStatus, { label: string; color: string }> = {
  pending:  { label: "На проверке",  color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  approved: { label: "Опубликовано", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  rejected: { label: "Отклонено",    color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
};

function useThemeAndColor() {
  const [dark, setDark] = useState<boolean>(() => {
    const s = localStorage.getItem("theme");
    if (s) return s === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [accent, setAccent] = useState<AccentColor>(() => (localStorage.getItem("accent") as AccentColor) || "blue");

  useEffect(() => {
    const root = document.documentElement;
    const hsl = dark ? DARK_ACCENT[accent] : ACCENT_COLORS[accent].hsl;
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--accent", hsl);
    root.style.setProperty("--ring", hsl);
    localStorage.setItem("theme", dark ? "dark" : "light");
    localStorage.setItem("accent", accent);
  }, [dark, accent]);

  return { dark, setDark, accent, setAccent };
}

export default function Index() {
  const [tab, setTab] = useState<Tab>("news");
  const [openNewsId, setOpenNewsId] = useState<number | null>(null);
  const [newsReactions, setNewsReactions] = useState<Record<number, NewsReactions>>({});
  const [newsComments, setNewsComments] = useState<Record<number, NewsComment[]>>({
    1: [
      { id: 1, author: "Иван П.", text: "Хорошо, что предупредили заранее. Запасусь водой.", time: "27 апр, 09:14" },
      { id: 2, author: "Мария С.", text: "А пер. Берёзовый тоже отключат?", time: "27 апр, 10:30" },
    ],
    2: [
      { id: 3, author: "Олег К.", text: "Буду! Главное — инвентарь нормальный дать, а не веники.", time: "25 апр, 14:05" },
    ],
  });
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [adFilter, setAdFilter] = useState<string>("Все");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [ads, setAds] = useState<Ad[]>(INITIAL_ADS);
  const [news, setNews] = useState<NewsItem[]>(NEWS_POOL);
  const [profileMyAdsOpen, setProfileMyAdsOpen] = useState(false);
  const [showNewAd, setShowNewAd] = useState(false);
  const [newAd, setNewAd] = useState({ title: "", text: "", category: "Продам", phone: "" });
  const [onlineCount, setOnlineCount] = useState(24);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [unreadChat, setUnreadChat] = useState(0);
  const [newNewsCount, setNewNewsCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const liveNewsIdx = useRef(0);
  const liveAdsIdx = useRef(0);
  const liveMsgIdx = useRef(0);
  const { dark, setDark, accent, setAccent } = useThemeAndColor();

  // Real-time simulation
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const roll = Math.random();

      // New chat message every ~15s
      if (roll < 0.4 && liveMsgIdx.current < LIVE_MESSAGES.length) {
        const m = LIVE_MESSAGES[liveMsgIdx.current++];
        const newMsg: Message = {
          id: Date.now(),
          author: m.author,
          text: m.text,
          time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
          mine: false,
          isNew: true,
        };
        setMessages(prev => [...prev, newMsg]);
        if (tab !== "chat") setUnreadChat(n => n + 1);
      }

      // New news every ~25s
      if (roll > 0.6 && liveNewsIdx.current < LIVE_NEWS.length) {
        const item = { ...LIVE_NEWS[liveNewsIdx.current++], isNew: true };
        setNews(prev => [item, ...prev]);
        setNewNewsCount(n => n + 1);
      }

      // New ad every ~30s
      if (roll > 0.45 && roll < 0.55 && liveAdsIdx.current < LIVE_ADS.length) {
        const item = { ...LIVE_ADS[liveAdsIdx.current++], isNew: true };
        setAds(prev => [item, ...prev]);
      }

      // Online count fluctuation
      setOnlineCount(n => Math.max(18, Math.min(35, n + Math.round((Math.random() - 0.5) * 3))));
      setLastUpdated(new Date());
    }, 8000);
    return () => clearInterval(interval);
  }, [isLive, tab]);

  // Auto scroll chat
  useEffect(() => {
    if (tab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadChat(0);
    }
  }, [messages, tab]);

  // Clear new badges when viewing
  useEffect(() => {
    if (tab === "news") setNewNewsCount(0);
    if (tab === "chat") setUnreadChat(0);
  }, [tab]);

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
      id: Date.now(),
      author: "Вы",
      text: chatInput,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      mine: true,
      isNew: true,
    }]);
    setChatInput("");
  };

  const submitAd = () => {
    if (!newAd.title.trim() || !newAd.text.trim()) return;
    setAds(prev => [{
      id: Date.now(),
      title: newAd.title,
      text: newAd.text,
      author: "Вы",
      date: "Сегодня",
      category: newAd.category,
      status: "pending",
      phone: newAd.phone || undefined,
      isNew: true,
    }, ...prev]);
    setNewAd({ title: "", text: "", category: "Продам", phone: "" });
    setShowNewAd(false);
  };

  const pendingAds = ads.filter(a => a.status === "pending");
  const myAds = ads.filter(a => a.author === "Вы");

  const getReaction = (id: number): NewsReactions =>
    newsReactions[id] ?? { likes: Math.floor(id * 3 + 2), dislikes: Math.floor(id * 0.5), myVote: null };

  const vote = (id: number, type: "like" | "dislike") => {
    setNewsReactions(prev => {
      const cur = getReaction(id);
      if (cur.myVote === type) {
        return { ...prev, [id]: { ...cur, [type === "like" ? "likes" : "dislikes"]: (type === "like" ? cur.likes : cur.dislikes) - 1, myVote: null } };
      }
      const next = { ...cur, myVote: type };
      if (type === "like") { next.likes = cur.likes + 1; if (cur.myVote === "dislike") next.dislikes = cur.dislikes - 1; }
      else { next.dislikes = cur.dislikes + 1; if (cur.myVote === "like") next.likes = cur.likes - 1; }
      return { ...prev, [id]: next };
    });
  };

  const addComment = (newsId: number) => {
    const text = (commentInputs[newsId] || "").trim();
    if (!text) return;
    const comment: NewsComment = { id: Date.now(), author: "Вы", text, time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }) };
    setNewsComments(prev => ({ ...prev, [newsId]: [...(prev[newsId] || []), comment] }));
    setCommentInputs(prev => ({ ...prev, [newsId]: "" }));
  };

  const openedNews = openNewsId !== null ? news.find(n => n.id === openNewsId) ?? null : null;

  const timeAgo = lastUpdated.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          {openedNews ? (
            <>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setOpenNewsId(null)}
                  className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 active:opacity-70"
                >
                  <Icon name="ArrowLeft" size={17} className="text-white" />
                </button>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight truncate">{openedNews.title}</p>
                  <span className="text-white/60 text-xs">{openedNews.date}</span>
                </div>
              </div>
              <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-white/15 text-white`}>
                {openedNews.category}
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon name="TreePine" size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-tight">Субботино</p>
                  <div className="flex items-center gap-1.5">
                    {isLive && <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />}
                    <p className="text-white/60 text-xs">{isLive ? `обновлено ${timeAgo}` : "обновление отключено"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLive(v => !v)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isLive ? "bg-white/10" : "bg-white/5"}`}
                >
                  <Icon name={isLive ? "Wifi" : "WifiOff"} size={15} className={isLive ? "text-green-300" : "text-white/40"} />
                </button>
                <button className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Icon name="Bell" size={16} className="text-white" />
                  {(unreadChat + newNewsCount) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-400 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-0.5">
                      {unreadChat + newNewsCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">

        {/* ── НОВОСТИ: список ── */}
        {tab === "news" && !openedNews && (
          <div className="animate-fade-in">
            <div className="px-4 pt-5 pb-3 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Новости посёлка</h2>
                <p className="text-muted-foreground text-sm mt-0.5">Актуальные события</p>
              </div>
              {isLive && (
                <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 text-xs font-semibold px-2.5 py-1.5 rounded-full mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  Live
                </div>
              )}
            </div>
            <div className="px-4 space-y-3 pb-4">
              {news.map((item, i) => {
                const r = getReaction(item.id);
                const comments = newsComments[item.id] || [];
                return (
                  <div
                    key={item.id}
                    className={`bg-card rounded-xl border overflow-hidden cursor-pointer active:scale-[0.99] transition-transform ${item.isNew ? "border-primary/40 animate-new-item" : "border-border"}`}
                    style={!item.isNew ? { animationDelay: `${i * 0.05}s`, opacity: 0, animation: "slideUp 0.35s ease forwards" } : undefined}
                    onClick={() => setOpenNewsId(item.id)}
                  >
                    {item.pinned && (
                      <div className="bg-primary/8 border-b border-primary/15 px-4 py-1.5 flex items-center gap-1.5">
                        <Icon name="Pin" size={12} className="text-primary" />
                        <span className="text-xs font-medium text-primary">Закреплено</span>
                      </div>
                    )}
                    {item.isNew && (
                      <div className="bg-primary/8 border-b border-primary/15 px-4 py-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                        <span className="text-xs font-semibold text-primary">Новое</span>
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
                      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon name="ThumbsUp" size={13} className={r.myVote === "like" ? "text-primary" : ""} />
                          <span className={r.myVote === "like" ? "text-primary font-semibold" : ""}>{r.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon name="ThumbsDown" size={13} className={r.myVote === "dislike" ? "text-destructive" : ""} />
                          <span className={r.myVote === "dislike" ? "text-destructive font-semibold" : ""}>{r.dislikes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon name="MessageSquare" size={13} />
                          <span>{comments.length}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-primary text-xs font-semibold">
                          Читать <Icon name="ChevronRight" size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── НОВОСТИ: страница ── */}
        {tab === "news" && openedNews && (() => {
          const item = openedNews;
          const r = getReaction(item.id);
          const comments = newsComments[item.id] || [];
          return (
            <div className="animate-fade-in">
              <div className="px-4 pt-5 pb-6">
                {item.pinned && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Icon name="Pin" size={13} className="text-primary" />
                    <span className="text-xs font-semibold text-primary">Закреплено</span>
                  </div>
                )}
                <h1 className="text-[21px] font-bold text-foreground leading-snug mb-2">{item.title}</h1>
                <p className="text-xs text-muted-foreground mb-5">{item.date}</p>
                <p className="text-[15px] text-foreground leading-relaxed">{item.text}</p>

                {/* Лайки / дизлайки */}
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => vote(item.id, "like")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all active:scale-95 ${
                      r.myVote === "like"
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                  >
                    <Icon name="ThumbsUp" size={17} />
                    <span className="font-semibold text-sm">{r.likes}</span>
                  </button>
                  <button
                    onClick={() => vote(item.id, "dislike")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all active:scale-95 ${
                      r.myVote === "dislike"
                        ? "bg-destructive text-white border-destructive shadow-sm"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                  >
                    <Icon name="ThumbsDown" size={17} />
                    <span className="font-semibold text-sm">{r.dislikes}</span>
                  </button>
                  {r.myVote && (
                    <span className="text-xs text-muted-foreground animate-fade-in">
                      {r.myVote === "like" ? "Понравилось" : "Не понравилось"}
                    </span>
                  )}
                </div>

                {/* Разделитель */}
                <div className="mt-7 border-t border-border" />

                {/* Комментарии */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon name="MessageSquare" size={16} className="text-muted-foreground" />
                      <h3 className="font-bold text-[15px] text-foreground">Комментарии</h3>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">{comments.length}</span>
                    </div>
                    <button
                      onClick={() => setShowCommentModal(true)}
                      className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg active:opacity-80 transition-opacity"
                    >
                      <Icon name="Plus" size={14} />
                      Написать
                    </button>
                  </div>

                  {comments.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <Icon name="MessageSquareDashed" size={36} className="mx-auto mb-2 opacity-25" />
                      <p className="text-sm">Пока нет комментариев</p>
                      <button
                        onClick={() => setShowCommentModal(true)}
                        className="mt-3 text-primary text-sm font-semibold underline underline-offset-2"
                      >
                        Будьте первым!
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {comments.map(c => (
                      <div key={c.id} className={`bg-card rounded-xl border p-3.5 ${c.author === "Вы" ? "border-primary/30 bg-primary/5 dark:bg-primary/10" : "border-border"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${c.author === "Вы" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                              {c.author[0]}
                            </div>
                            <span className="text-sm font-semibold text-foreground">{c.author}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{c.time}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed pl-9">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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
                  className={`bg-card rounded-xl border p-4 ${ad.isNew ? "border-primary/40 animate-new-item" : "border-border animate-slide-up"}`}
                  style={!ad.isNew ? { animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: "forwards" } : undefined}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor[ad.category] || "bg-gray-100 text-gray-600"}`}>{ad.category}</span>
                      {ad.isNew && <span className="text-xs font-semibold text-primary flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />Новое</span>}
                    </div>
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
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
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
                  <span className="text-xs text-muted-foreground">{onlineCount} онлайн</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                <Icon name="Shield" size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">Сообщения проверяются модератором</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.mine ? "justify-end" : "justify-start"} ${msg.isNew ? "animate-new-item" : ""}`}>
                  {msg.status === "flagged" ? (
                    <div className="max-w-[82%] bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-1.5">
                          <Icon name="AlertTriangle" size={13} className="text-red-500" />
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400">Подозрительное</span>
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
              <div ref={chatEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-border bg-background shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Написать сообщение..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
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
                    <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                      <Icon name="Tag" size={18} className="text-violet-600 dark:text-violet-400" />
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
                    {myAds.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Пока нет объявлений</p>}
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
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                      <Icon name="Bell" size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Уведомления</p>
                      <p className="text-xs text-muted-foreground">3 непрочитанных</p>
                    </div>
                  </div>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
                </div>
              </div>

              {/* ─── НАСТРОЙКИ ОФОРМЛЕНИЯ ─── */}
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-4 py-3.5 border-b border-border flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Icon name="Palette" size={18} className="text-slate-600 dark:text-slate-400" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Оформление</p>
                </div>

                {/* Тёмная тема */}
                <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Тёмная тема</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Комфортно для глаз ночью</p>
                  </div>
                  <button
                    onClick={() => setDark(v => !v)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${dark ? "bg-primary" : "bg-muted"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${dark ? "translate-x-6" : "translate-x-0"} flex items-center justify-center`}>
                      <Icon name={dark ? "Moon" : "Sun"} size={11} className={dark ? "text-slate-700" : "text-amber-500"} />
                    </div>
                  </button>
                </div>

                {/* Цвет акцента */}
                <div className="px-4 py-3.5">
                  <p className="text-sm font-medium text-foreground mb-2.5">Цвет акцента</p>
                  <div className="flex gap-2.5 flex-wrap">
                    {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setAccent(key)}
                        className={`flex flex-col items-center gap-1.5 group`}
                      >
                        <div className={`w-8 h-8 rounded-full ${val.dot} transition-transform ${accent === key ? "scale-125 ring-2 ring-offset-2 ring-offset-card" : "group-hover:scale-110"}`}
                          style={accent === key ? { boxShadow: `0 0 0 2px hsl(${val.hsl})` } : undefined}
                        />
                        <span className={`text-[10px] font-medium ${accent === key ? "text-foreground" : "text-muted-foreground"}`}>{val.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time toggle */}
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLive ? "bg-green-100 dark:bg-green-950" : "bg-muted"}`}>
                      <Icon name={isLive ? "Wifi" : "WifiOff"} size={18} className={isLive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Обновление в реальном времени</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isLive ? `Активно · обновлено в ${timeAgo}` : "Отключено"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLive(v => !v)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isLive ? "bg-green-500" : "bg-muted"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${isLive ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>

              {/* Модератор */}
              <div className={`rounded-xl border overflow-hidden shadow-sm ${pendingAds.length > 0 ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" : "bg-card border-border"}`}>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                      <Icon name="Shield" size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Панель модератора</p>
                      <p className="text-xs text-muted-foreground">
                        {pendingAds.length > 0 ? `${pendingAds.length} ждут проверки` : "Нет ожидающих"}
                      </p>
                    </div>
                  </div>
                  {pendingAds.length > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingAds.length}</span>
                  )}
                </div>
                {pendingAds.length > 0 && (
                  <div className="border-t border-amber-200 dark:border-amber-800 px-4 py-3 space-y-2">
                    {pendingAds.map(ad => (
                      <div key={ad.id} className="bg-white dark:bg-card rounded-lg border border-amber-200 dark:border-amber-800 p-3">
                        <p className="text-sm font-semibold text-foreground">{ad.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ad.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">от {ad.author} · {ad.date}</p>
                        <div className="flex gap-2 mt-2.5">
                          <button
                            onClick={() => setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: "approved" } : a))}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-semibold py-2 rounded-lg active:opacity-80"
                          >
                            <Icon name="Check" size={14} /> Одобрить
                          </button>
                          <button
                            onClick={() => setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: "rejected" } : a))}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-xs font-semibold py-2 rounded-lg active:opacity-80"
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
          {navItems.map(item => {
            const badge = item.id === "chat" ? unreadChat : item.id === "news" ? newNewsCount : item.id === "profile" ? pendingAds.length : 0;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${tab === item.id ? "text-primary" : "text-muted-foreground"}`}
              >
                <div className={`relative p-1.5 rounded-xl transition-colors ${tab === item.id ? "bg-primary/10" : ""}`}>
                  <Icon name={item.icon} size={20} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                      {badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] ${tab === item.id ? "font-bold" : "font-medium"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modal: Новое объявление */}
      {showNewAd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowNewAd(false)}>
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
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Описание</label>
                <textarea
                  rows={3}
                  placeholder="Подробности..."
                  value={newAd.text}
                  onChange={e => setNewAd(p => ({ ...p, text: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Категория</label>
                  <select
                    value={newAd.category}
                    onChange={e => setNewAd(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
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
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5">
                <Icon name="Info" size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">Объявление будет опубликовано после проверки модератором</p>
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

      {/* Modal: Комментарий */}
      {showCommentModal && openedNews && (() => {
        const id = openedNews.id;
        const val = commentInputs[id] || "";
        return (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowCommentModal(false)}>
            <div
              className="w-full max-w-lg bg-card rounded-t-2xl p-5 animate-slide-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-bold text-base text-foreground">Комментарий</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{openedNews.title}</p>
                </div>
                <button onClick={() => setShowCommentModal(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center ml-3 shrink-0">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <textarea
                  rows={4}
                  autoFocus
                  placeholder="Напишите ваш комментарий..."
                  value={val}
                  onChange={e => setCommentInputs(prev => ({ ...prev, [id]: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground resize-none"
                />
                <button
                  onClick={() => { addComment(id); setShowCommentModal(false); }}
                  disabled={!val.trim()}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-40 active:opacity-80 transition-opacity flex items-center justify-center gap-2"
                >
                  <Icon name="Send" size={16} className="text-white" />
                  Опубликовать
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}