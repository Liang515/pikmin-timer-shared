"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ExternalLink, Trash2, RotateCcw, Clock, BellRing, Sparkles, Users, Edit3, Check, X, MapPin, Globe, Moon, Sun, ChevronUp, ChevronDown, Copy, LogOut, Share2, Users2, ArrowLeft } from 'lucide-react';
import { Mushroom, AreaGroup } from '@/types/mushroom';
import { db, auth } from './firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Preferences } from '@capacitor/preferences';

type Lang = 'zh' | 'en';
const T = {
  zh: {
    home: '首頁',
    battleEnded: '⚔️ 戰鬥結束！',
    battleEndedBody: (name: string) => `${name} 的戰鬥已完成，5分鐘後重生。`,
    respawned: '🍄 蘑菇已重生！',
    respawnedBody: (name: string) => `${name} 已經重生完畢！`,
    defaultMushroom: '蘑菇',
    enterArea: '請輸入區域名稱:',
    newArea: '新區域',
    keepOneArea: '至少需保留一個區域',
    confirmDeleteArea: '確定要刪除此區域嗎？其中的紀錄也會一起刪除。',
    renameArea: '重新命名區域:',
    title: '🍄 蘑菇戰報',
    deleteTab: '刪除目前分頁',
    noRecords: (name: string) => `「${name}」目前沒有紀錄`,
    clickToAdd: '點擊右下角 + 開始新增',
    addTo: '新增至 ',
    mushroomName: '蘑菇名稱 (選填)',
    mushroomNamePlaceholder: '例如：火屬性巨大蘑菇',
    participants: '參戰人數',
    remainingTime: '剩餘戰鬥時間',
    m15: '15分',
    m30: '30分',
    h1: '1小時',
    h3: '3小時',
    h8: '8小時',
    startTracking: '建立追蹤',
    resetTime: '重新設定剩餘時間 (選填)',
    saveChanges: '儲存修改',
    cancel: '取消',
    players: '人',
    respawning: '重生中',
    battleEnds: '戰鬥結束：',
    estRespawn: '預計重生：',
    respawnComplete: '重生完成',
    languageToggle: 'EN',
    allAreas: '所有區域快速選擇',
    collapse: '收起',
    expand: '展開所有區域',
    recordsCount: (count: number) => `${count} 個紀錄`,
    confirmDelete: '確定刪除？',
    deleteBtn: '刪除',
    
    // V4 Shared version strings
    welcomeTitle: '🍄 共享蘑菇戰報',
    welcomeSubtitle: '建立一個多人共享房間，與您的探險小隊即時同步所有蘑菇重生倒數！',
    createRoomBtn: '✨ 建立共享房間',
    joinRoomBtn: '🔗 加入共享房間',
    localModeBtn: '👤 個人單機模式',
    roomNameLabel: '共享房間名稱',
    roomNamePlaceholder: '例如：台北大安團、台中追菇小隊',
    roomCodeLabel: '請輸入 6 位數房間密碼',
    roomCodePlaceholder: '例如：X9W3R2',
    creatingRoom: '正在建立房間...',
    joiningRoom: '正在加入房間...',
    invalidRoomCode: '房間密碼無效或找不到該房間',
    roomInfoTitle: '正在共享房間：',
    copiedLink: '📋 邀請連結已複製！',
    copyLinkBtn: '複製邀請連結',
    exitRoomBtn: '退出房間',
    roomCreator: '房主',
    playersInRoom: '在線成員',
    recentRoomsTitle: '⏱️ 最近加入的房間'
  },
  en: {
    home: 'Home',
    battleEnded: '⚔️ Battle Ended!',
    battleEndedBody: (name: string) => `${name} battle completed. Respawning in 5 mins.`,
    respawned: '🍄 Mushroom Respawned!',
    respawnedBody: (name: string) => `${name} has respawned!`,
    defaultMushroom: 'Mushroom',
    enterArea: 'Enter area name:',
    newArea: 'New Area',
    keepOneArea: 'At least one area must be kept.',
    confirmDeleteArea: 'Delete this area and all its records?',
    renameArea: 'Rename area:',
    title: '🍄 Mushroom Timer',
    deleteTab: 'Delete current tab',
    noRecords: (name: string) => `No records in '${name}'`,
    clickToAdd: 'Click + to add a mushroom',
    addTo: 'Add to ',
    mushroomName: 'Mushroom Name (Optional)',
    mushroomNamePlaceholder: 'e.g., Large Fire Mushroom',
    participants: 'Participants',
    remainingTime: 'Remaining Battle Time',
    m15: '15m',
    m30: '30m',
    h1: '1h',
    h3: '3h',
    h8: '8h',
    startTracking: 'Start Tracking',
    resetTime: 'Reset Time (Optional)',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    players: 'players',
    respawning: 'Respawning',
    battleEnds: 'Battle Ends: ',
    estRespawn: 'Est. Respawn: ',
    respawnComplete: 'Respawn Complete',
    languageToggle: '中',
    allAreas: 'All Areas Quick Select',
    collapse: 'Collapse',
    expand: 'Expand All Areas',
    recordsCount: (count: number) => `${count} ${count === 1 ? 'record' : 'records'}`,
    confirmDelete: 'Delete?',
    deleteBtn: 'Delete',
    
    // V4 Shared version strings
    welcomeTitle: '🍄 Shared Mushroom Timer',
    welcomeSubtitle: 'Create a shared room and sync all active countdowns in real-time with your squad!',
    createRoomBtn: '✨ Create Shared Room',
    joinRoomBtn: '🔗 Join Shared Room',
    localModeBtn: '👤 Local Offline Mode',
    roomNameLabel: 'Shared Room Name',
    roomNamePlaceholder: 'e.g., Central Park Raiders',
    roomCodeLabel: 'Enter 6-character Room Code',
    roomCodePlaceholder: 'e.g., X9W3R2',
    creatingRoom: 'Creating room...',
    joiningRoom: 'Joining room...',
    invalidRoomCode: 'Invalid code or room not found',
    roomInfoTitle: 'Sharing Room: ',
    copiedLink: '📋 Invite link copied!',
    copyLinkBtn: 'Copy Invite Link',
    exitRoomBtn: 'Exit Room',
    roomCreator: 'Creator',
    playersInRoom: 'Online Members',
    recentRoomsTitle: '⏱️ Recent Rooms'
  }
};

/* ─── Keyboard Time Picker Component ─── */
function KeyboardTimePicker({ h, m, s, onChangeH, onChangeM, onChangeS, onEnter }: {
  h: number; m: number; s: number;
  onChangeH: (v: number) => void;
  onChangeM: (v: number) => void;
  onChangeS: (v: number) => void;
  onEnter?: () => void;
}) {
  const hRef = useRef<HTMLInputElement>(null);
  const mRef = useRef<HTMLInputElement>(null);
  const sRef = useRef<HTMLInputElement>(null);

  // Local string state to handle typing "0", "05", or blank states smoothly
  const [hStr, setHStr] = useState(h === 0 ? "" : h.toString());
  const [mStr, setMStr] = useState(m === 0 ? "" : m.toString());
  const [sStr, setSStr] = useState(s === 0 ? "" : s.toString());

  // Sync inputs if parent values change (such as when clicking preset buttons like 15m/30m/1h)
  useEffect(() => {
    setHStr(h === 0 ? "" : h.toString());
    setMStr(m === 0 ? "" : m.toString());
    setSStr(s === 0 ? "" : s.toString());
  }, [h, m, s]);

  // Auto focus first input (Hours) on mount with a safe delay
  useEffect(() => {
    const timer = setTimeout(() => {
      hRef.current?.focus();
      hRef.current?.select();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (
    val: string,
    max: number,
    setStr: (s: string) => void,
    onChange: (v: number) => void,
    nextRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    const digits = val.replace(/\D/g, '').slice(0, 2);
    setStr(digits);

    const parsed = digits === '' ? 0 : parseInt(digits);
    const num = Math.min(max, parsed);
    onChange(num);

    // Smart Auto-jump to next field
    const isAutoJump = digits.length >= 2 || 
      (digits.length === 1 && (
        (max === 23 && parseInt(digits) >= 3) || 
        (max === 59 && parseInt(digits) >= 6)
      ));

    if (isAutoJump && nextRef && nextRef.current) {
      nextRef.current.focus();
      nextRef.current.select();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    prevRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    if (e.key === 'Backspace' && e.currentTarget.value === '' && prevRef && prevRef.current) {
      prevRef.current.focus();
      prevRef.current.select();
      e.preventDefault();
    }
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 px-4 w-full">
      <div className="flex flex-col items-center gap-1 flex-1">
        <input
          ref={hRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={hStr}
          onChange={e => handleInputChange(e.target.value, 23, setHStr, onChangeH, mRef)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="00"
          className="w-full text-center text-2xl font-mono font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl py-2 outline-none text-slate-800 dark:text-slate-100 transition-colors shadow-sm focus:shadow-md"
        />
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">時 (H)</span>
      </div>
      
      <span className="text-2xl font-black text-slate-300 dark:text-slate-700 mb-5">:</span>

      <div className="flex flex-col items-center gap-1 flex-1">
        <input
          ref={mRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={mStr}
          onChange={e => handleInputChange(e.target.value, 59, setMStr, onChangeM, sRef)}
          onKeyDown={e => handleKeyDown(e, hRef)}
          placeholder="00"
          className="w-full text-center text-2xl font-mono font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl py-2 outline-none text-slate-800 dark:text-slate-100 transition-colors shadow-sm focus:shadow-md"
        />
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">分 (M)</span>
      </div>

      <span className="text-2xl font-black text-slate-300 dark:text-slate-700 mb-5">:</span>

      <div className="flex flex-col items-center gap-1 flex-1">
        <input
          ref={sRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={sStr}
          onChange={e => handleInputChange(e.target.value, 59, setSStr, onChangeS)}
          onKeyDown={e => handleKeyDown(e, mRef)}
          placeholder="00"
          className="w-full text-center text-2xl font-mono font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl py-2 outline-none text-slate-800 dark:text-slate-100 transition-colors shadow-sm focus:shadow-md"
        />
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">秒 (S)</span>
      </div>
    </div>
  );
}

/* ─── Participant Slider ─── */
function ParticipantSlider({ value, onChange }: {
  value: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.max(1, Math.min(30, v));
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 1}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus size={18} />
      </button>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-center">
          <Users size={16} className="text-emerald-500 dark:text-emerald-400 mr-1.5" />
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums min-w-[2ch] text-center">{value}</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="participant-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-emerald-600"
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 px-0.5">
          <span>1</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= 30}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

const COLORS = [
  'from-blue-400 to-indigo-500 shadow-blue-500/30',
  'from-purple-400 to-fuchsia-500 shadow-purple-500/30',
  'from-rose-400 to-red-500 shadow-red-500/30',
  'from-emerald-400 to-teal-500 shadow-emerald-500/30',
  'from-amber-300 to-orange-500 shadow-orange-500/30',
];

const safeGetItem = async (key: string): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  // 1. Try Capacitor Preferences first
  try {
    const { value } = await Preferences.get({ key });
    if (value !== null) {
      console.log(`[Storage] Preferences GET success: ${key} = ${value}`);
      return value;
    }
  } catch (e) {
    console.error(`[Storage] Preferences GET error for ${key}:`, e);
  }
  // 2. Fall back to standard localStorage
  try {
    const val = localStorage.getItem(key);
    console.log(`[Storage] LocalStorage fallback GET: ${key} = ${val}`);
    return val;
  } catch (e) {
    console.error(`[Storage] LocalStorage GET error for ${key}:`, e);
    return null;
  }
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  // 1. Write to standard localStorage first for fast synchronous backup
  try {
    localStorage.setItem(key, value);
    console.log(`[Storage] LocalStorage SET success: ${key}`);
  } catch (e) {
    console.error(`[Storage] LocalStorage SET error for ${key}:`, e);
  }
  // 2. Write to Capacitor Preferences for native persistent backup
  try {
    await Preferences.set({ key, value });
    console.log(`[Storage] Preferences SET success: ${key}`);
  } catch (e) {
    console.error(`[Storage] Preferences SET error for ${key}:`, e);
  }
};

export default function PikminDashboard() {
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [groups, setGroups] = useState<AreaGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [now, setNow] = useState(Date.now());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addH, setAddH] = useState(0);
  const [addM, setAddM] = useState(0);
  const [addS, setAddS] = useState(0);
  const [addP, setAddP] = useState(5);
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Compact inline area editing states
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [deleteConfirmGroupId, setDeleteConfirmGroupId] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(false);

  // V4 Shared Room States
  const [roomId, setRoomId] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loadingRoom, setLoadingRoom] = useState<boolean>(false);
  const [roomError, setRoomError] = useState<string>("");
  const [showCopyMessage, setShowCopyMessage] = useState<boolean>(false);
  const [showCodeCopyMessage, setShowCodeCopyMessage] = useState<boolean>(false);
  const [recentRooms, setRecentRooms] = useState<{ id: string; name: string; joinedAt: number }[]>([]);
  const [roomCreatorId, setRoomCreatorId] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(err => {
        console.error('Secure copy failed, trying fallback', err);
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const notifiedSet = useRef<Set<string>>(new Set());
  const [isRestoredState, setIsRestoredState] = useState(false);

  const saveRecentRoom = (code: string, name: string) => {
    const cleanCode = code.toUpperCase();
    setRecentRooms(prev => {
      const filtered = prev.filter(r => r.id !== cleanCode);
      const updated = [
        { id: cleanCode, name: name || "共享房間", joinedAt: Date.now() },
        ...filtered
      ].slice(0, 5);
      safeSetItem('pikmin_recent_rooms', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentRoom = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    const cleanCode = code.toUpperCase();
    setRecentRooms(prev => {
      const updated = prev.filter(r => r.id !== cleanCode);
      safeSetItem('pikmin_recent_rooms', JSON.stringify(updated));
      return updated;
    });
  };

  const t = T[lang];

  // 1. Firebase Auth Anonymous Sign-In on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth)
          .then((userCred) => {
            setUserId(userCred.user.uid);
          })
          .catch((err) => {
            console.error("Firebase auth error:", err);
          });
      }
    });
    return () => unsubscribe();
  }, []);

  // 1.5 Capacitor Preferences Diagnostics on mount
  useEffect(() => {
    const runDiagnostics = async () => {
      if (typeof window === 'undefined') return;
      try {
        await Preferences.set({ key: 'cap_diag_test', value: 'OK' });
        const { value } = await Preferences.get({ key: 'cap_diag_test' });
        if (value === 'OK') {
          setDebugInfo("Preferences Diagnostics: SUCCESS (Native UserDefaults persistence verified)");
        } else {
          setDebugInfo("Preferences Diagnostics: ERROR (Native returned incorrect value)");
        }
      } catch (e: any) {
        const errMsg = e?.message || e?.toString() || "Unknown plugin exception";
        setDebugInfo(`Preferences Diagnostics: ERROR (${errMsg})`);
      }
    };
    runDiagnostics();
  }, []);

  // 2. Language & Theme setup on mount
  useEffect(() => {
    const initStorage = async () => {
      const savedLang = await safeGetItem('pikmin_lang') as Lang;
      const savedTheme = await safeGetItem('pikmin_theme') as 'light' | 'dark' | null;
      const savedRecent = await safeGetItem('pikmin_recent_rooms');
      if (savedRecent) {
        try {
          setRecentRooms(JSON.parse(savedRecent));
        } catch (e) {
          console.error(e);
        }
      }

      if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
        setLang(savedLang);
      }

      let initialTheme: 'light' | 'dark' = 'light';
      if (savedTheme === 'light' || savedTheme === 'dark') {
        initialTheme = savedTheme;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
      }
      setTheme(initialTheme);
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    initStorage();

    const timer = setInterval(() => setNow(Date.now()), 1000);
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return () => clearInterval(timer);
  }, []);

  // 3. Check URL parameters for ?room=X9W3R2 or restore saved active room
  useEffect(() => {
    if (isRestoredState) return;

    const restoreRoom = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
          const code = roomParam.trim().toUpperCase();
          if (code.length === 6) {
            await joinRoom(code);
          }
        } else {
          const savedRoomId = await safeGetItem('pikmin_active_room');
          if (savedRoomId) {
            if (savedRoomId === "local") {
              setRoomId("local");
            } else if (savedRoomId.trim().toUpperCase().length === 6) {
              await joinRoom(savedRoomId.trim().toUpperCase());
            }
          }
        }
      } catch (e) {
        console.error("Error restoring room:", e);
      } finally {
        setIsRestoredState(true);
      }
    };

    restoreRoom();
  }, [isRestoredState]);

  // 4. Load from LocalStorage/Preferences if roomId === "local"
  useEffect(() => {
    if (roomId !== "local") return;

    const loadLocalData = async () => {
      const savedMs = await safeGetItem('pikmin_mushrooms');
      const savedGroups = await safeGetItem('pikmin_groups');
      
      let initialGroups: AreaGroup[] = [{ id: 'default', name: lang === 'en' ? 'Home' : '首頁', lastAccessed: Date.now() }];
      if (savedGroups) {
        try {
          initialGroups = JSON.parse(savedGroups);
          initialGroups.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
        } catch (e) {
          console.error(e);
        }
      }
      setGroups(initialGroups);

      const savedActiveGroup = await safeGetItem('pikmin_active_group_id');
      const groupExists = savedActiveGroup && initialGroups.some(g => g.id === savedActiveGroup);
      setActiveGroupId(groupExists ? (savedActiveGroup as string) : initialGroups[0].id);

      if (savedMs) {
        try {
          setMushrooms(JSON.parse(savedMs));
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadLocalData();
  }, [roomId]);

  // 5. Save to LocalStorage/Preferences if roomId === "local"
  useEffect(() => {
    if (roomId !== "local") return;
    safeSetItem('pikmin_mushrooms', JSON.stringify(mushrooms));
    safeSetItem('pikmin_groups', JSON.stringify(groups));
  }, [mushrooms, groups, roomId]);

  // 5.5 Save language preference unconditionally on change
  useEffect(() => {
    safeSetItem('pikmin_lang', lang);
  }, [lang]);

  // Save active room preference unconditionally on change
  useEffect(() => {
    if (isRestoredState) {
      safeSetItem('pikmin_active_room', roomId);
    }
  }, [roomId, isRestoredState]);

  // Save active group preference unconditionally on change
  useEffect(() => {
    if (activeGroupId && isRestoredState) {
      safeSetItem('pikmin_active_group_id', activeGroupId);
    }
  }, [activeGroupId, isRestoredState]);

  // 6. Push local notifications for timers
  useEffect(() => {
    mushrooms.forEach(m => {
      const bEnd = m.battleEndTime || (m.endTime - 5 * 60000);
      if (now >= bEnd && !notifiedSet.current.has(m.id + '_battle')) {
        notifiedSet.current.add(m.id + '_battle');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(T[lang].battleEnded, { body: T[lang].battleEndedBody(m.name) });
        }
      }
      if (now >= m.endTime && !notifiedSet.current.has(m.id + '_respawn')) {
        notifiedSet.current.add(m.id + '_respawn');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(T[lang].respawned, { body: T[lang].respawnedBody(m.name) });
        }
      }
    });
  }, [mushrooms, now, lang]);

  // 7. Subscribe to Firestore if roomId is active
  useEffect(() => {
    if (!roomId || roomId === "local") return;

    // Subscribe to Groups
    const groupsRef = collection(db, "rooms", roomId, "groups");
    const unsubscribeGroups = onSnapshot(groupsRef, (snapshot) => {
      const list: AreaGroup[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as AreaGroup);
      });
      list.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
      if (list.length > 0) {
        setGroups(list);
        setActiveGroupId(prevActive => {
          if (prevActive && list.some(g => g.id === prevActive)) {
            return prevActive;
          }
          const savedActiveGroup = localStorage.getItem('pikmin_active_group_id');
          if (savedActiveGroup && list.some(g => g.id === savedActiveGroup)) {
            return savedActiveGroup;
          }
          return list[0].id;
        });
      }
    });

    // Subscribe to Mushrooms
    const mushroomsRef = collection(db, "rooms", roomId, "mushrooms");
    const unsubscribeMushrooms = onSnapshot(mushroomsRef, (snapshot) => {
      const list: Mushroom[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Mushroom);
      });
      setMushrooms(list);
    });

    return () => {
      unsubscribeGroups();
      unsubscribeMushrooms();
    };
  }, [roomId]);

  // 8. Shared Room Helper Functions
  const joinRoom = async (code: string) => {
    setLoadingRoom(true);
    setRoomError("");
    try {
      const roomRef = doc(db, "rooms", code);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const data = roomSnap.data();
        const rName = data.name || "共享房間";
        setRoomName(rName);
        setRoomId(code);
        setRoomCreatorId(data.creatorId || "");
        saveRecentRoom(code, rName);
        
        // Update URL query parameters
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?room=${code}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } else {
        setRoomError(t.invalidRoomCode);
      }
    } catch (err) {
      console.error("Join room error:", err);
      setRoomError("無法加入房間，請檢查網路連線或金鑰");
    } finally {
      setLoadingRoom(false);
    }
  };

  const createRoom = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoadingRoom(true);
    setRoomError("");
    try {
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      
      const roomRef = doc(db, "rooms", code);
      await setDoc(roomRef, {
        name: trimmed,
        createdAt: Date.now(),
        creatorId: userId,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      const defaultGroup = {
        id: "default",
        name: lang === 'zh' ? '首頁' : 'Home',
        lastAccessed: Date.now(),
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      await setDoc(doc(db, "rooms", code, "groups", "default"), defaultGroup);
      
      setRoomName(trimmed);
      setRoomId(code);
      setRoomCreatorId(userId);
      saveRecentRoom(code, trimmed);
      
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?room=${code}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    } catch (err) {
      console.error("Create room error:", err);
      setRoomError("無法建立房間，請檢查網路連線");
    } finally {
      setLoadingRoom(false);
    }
  };

  const exitRoom = () => {
    setRoomId("");
    setRoomName("");
    setRoomError("");
    setRoomCreatorId("");
    // Clean query parameters
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  };

  const deleteRoom = async () => {
    if (!roomId || roomId === "local") return;
    const isOwner = roomCreatorId === userId;
    if (!isOwner) return;

    const confirmMsg = lang === 'zh' 
      ? "⚠️ 確定要刪除整個房間嗎？此動作將會清除本房間所有的區域與蘑菇紀錄，且無法復原！" 
      : "⚠️ Are you sure you want to delete this entire room? This will wipe out all areas and mushrooms in this room and cannot be undone!";
      
    if (!window.confirm(confirmMsg)) return;

    setLoadingRoom(true);
    try {
      // 1. Delete all mushrooms
      const mushroomsRef = collection(db, "rooms", roomId, "mushrooms");
      const mushroomsSnap = await getDocs(mushroomsRef);
      const batch = writeBatch(db);
      mushroomsSnap.forEach(d => {
        batch.delete(d.ref);
      });

      // 2. Delete all groups
      const groupsRef = collection(db, "rooms", roomId, "groups");
      const groupsSnap = await getDocs(groupsRef);
      groupsSnap.forEach(d => {
        batch.delete(d.ref);
      });

      // 3. Delete the room itself
      batch.delete(doc(db, "rooms", roomId));

      // Commit the batch
      await batch.commit();

      // 4. Clean up recent rooms list in local storage
      setRecentRooms(prev => {
        const updated = prev.filter(r => r.id !== roomId);
        safeSetItem('pikmin_recent_rooms', JSON.stringify(updated));
        return updated;
      });

      // 5. Exit room
      exitRoom();
      
      const successMsg = lang === 'zh' ? "房間已成功刪除！" : "Room deleted successfully!";
      alert(successMsg);
    } catch (err) {
      console.error("Delete room error:", err);
      const errMsg = lang === 'zh' ? "刪除房間失敗，請稍後再試" : "Failed to delete room. Please try again.";
      setRoomError(errMsg);
    } finally {
      setLoadingRoom(false);
    }
  };

  // 9. Data modifiers
  const addMushroom = async (h: number, m: number, s: number, name: string, participants: number) => {
    const battleMs = (h * 3600 + m * 60 + s) * 1000;
    const battleEndTime = Date.now() + battleMs;
    const endTime = battleEndTime + 5 * 60 * 1000;
    const newMs: Mushroom = {
      id: crypto.randomUUID(),
      name: name || t.defaultMushroom,
      groupId: activeGroupId,
      participants: participants || 5,
      startTime: Date.now(),
      battleEndTime,
      endTime,
      note: "",
      isFavorite: false,
      color: COLORS[mushrooms.length % COLORS.length]
    };

    if (roomId === "local") {
      setMushrooms([...mushrooms, newMs]);
    } else {
      await setDoc(doc(db, "rooms", roomId, "mushrooms", newMs.id), {
        ...newMs,
        expireAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });
    }
  };

  const updateMushroom = async (id: string, updates: Partial<Mushroom>) => {
    if (roomId === "local") {
      setMushrooms(mushrooms.map(m => m.id === id ? { ...m, ...updates } : m));
    } else {
      await updateDoc(doc(db, "rooms", roomId, "mushrooms", id), {
        ...updates,
        expireAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });
    }
  };

  const deleteMushroom = async (id: string) => {
    notifiedSet.current.delete(id + '_battle');
    notifiedSet.current.delete(id + '_respawn');
    if (editingId === id) setEditingId(null);

    if (roomId === "local") {
      setMushrooms(mushrooms.filter(m => m.id !== id));
    } else {
      await deleteDoc(doc(db, "rooms", roomId, "mushrooms", id));
    }
  };

  const handleSetActiveGroup = async (id: string) => {
    setActiveGroupId(id);
    const updatedGroups = groups.map(g => g.id === id ? { ...g, lastAccessed: Date.now() } : g);
    if (roomId === "local") {
      setGroups(updatedGroups.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0)));
    } else {
      await updateDoc(doc(db, "rooms", roomId, "groups", id), { 
        lastAccessed: Date.now(),
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
  };

  const startAddGroup = () => {
    setIsAddingGroup(true);
    setNewGroupName("");
    setDeleteConfirmGroupId(null);
  };

  const commitAddGroup = async () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      setIsAddingGroup(false);
      return;
    }
    const newGroup = { id: crypto.randomUUID(), name: trimmed, lastAccessed: Date.now() };
    
    if (roomId === "local") {
      setGroups(prev => [newGroup, ...prev]);
      setActiveGroupId(newGroup.id);
    } else {
      await setDoc(doc(db, "rooms", roomId, "groups", newGroup.id), {
        ...newGroup,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      setActiveGroupId(newGroup.id);
    }
    setIsAddingGroup(false);
    setNewGroupName("");
  };

  const cancelAddGroup = () => {
    setIsAddingGroup(false);
    setNewGroupName("");
  };

  const startRenameGroup = (id: string, currentName: string) => {
    setEditingGroupId(id);
    setEditGroupName(currentName);
    setDeleteConfirmGroupId(null);
  };

  const commitRenameGroup = async (id: string) => {
    const trimmed = editGroupName.trim();
    if (trimmed) {
      if (roomId === "local") {
        setGroups(groups.map(g => g.id === id ? { ...g, name: trimmed } : g));
      } else {
        await updateDoc(doc(db, "rooms", roomId, "groups", id), { 
          name: trimmed,
          expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }
    }
    setEditingGroupId(null);
  };

  const handleDeleteGroupClick = (id: string) => {
    if (groups.length <= 1) {
      setWarningMessage(t.keepOneArea);
      return;
    }
    setDeleteConfirmGroupId(id);
    setIsAddingGroup(false);
  };

  const confirmDeleteGroup = async (id: string) => {
    const remaining = groups.filter(g => g.id !== id);
    if (roomId === "local") {
      setGroups(remaining);
      setMushrooms(mushrooms.filter(m => m.groupId !== id));
      if (activeGroupId === id && remaining.length > 0) {
        handleSetActiveGroup(remaining[0].id);
      }
    } else {
      await deleteDoc(doc(db, "rooms", roomId, "groups", id));
      const groupMs = mushrooms.filter(m => m.groupId === id);
      for (const m of groupMs) {
        await deleteDoc(doc(db, "rooms", roomId, "mushrooms", m.id));
      }
      if (activeGroupId === id && remaining.length > 0) {
        setActiveGroupId(remaining[0].id);
      }
    }
    setDeleteConfirmGroupId(null);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    safeSetItem('pikmin_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAddSubmit = () => {
    const n = (document.getElementById('quick-name') as HTMLInputElement)?.value || "";
    addMushroom(addH, addM, addS, n, addP);
    setIsAdding(false);
    setAddH(0); setAddM(0); setAddS(0); setAddP(5);
  };

  const activeMushrooms = mushrooms.filter(m => m.groupId === activeGroupId);
  const sortedMushrooms = [...activeMushrooms].sort((a, b) => {
    const aOver = now > a.endTime;
    const bOver = now > b.endTime;
    if (aOver && !bOver) return 1;
    if (!aOver && bOver) return -1;
    return a.endTime - b.endTime;
  });

  if (!roomId) {
    return (
      <main className={`min-h-screen bg-gradient-to-tr from-stone-100 via-emerald-50/15 to-amber-50/20 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-900 p-4 flex items-center justify-center font-sans transition-all duration-500 ${theme}`}>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={toggleTheme} className="p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300 active:scale-95 hover:scale-105 transition-all border border-stone-200/10" title="切換主題">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="px-3.5 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300 active:scale-95 hover:scale-105 transition-all font-bold flex items-center gap-1.5 text-sm border border-stone-200/10">
             <Globe size={16} /> <span>{t.languageToggle}</span>
          </button>
        </div>

        <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-stone-200/60 dark:border-slate-800/80 shadow-xl rounded-[2.5rem] p-6 sm:p-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
          {/* Decorative background lights */}
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shadow-inner mx-auto mb-3.5">
              <span className="text-3xl select-none">🍄</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight mb-2">
              {t.welcomeTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium px-2 leading-relaxed">
              {t.welcomeSubtitle}
            </p>
          </div>

          {roomError && (
            <div className="mb-4 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold px-4 py-2.5 rounded-full border border-rose-500/20 flex items-center gap-1.5 animate-in slide-in-from-top-2 duration-200">
              <span>⚠️ {roomError}</span>
            </div>
          )}

          {loadingRoom ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {roomError ? t.joiningRoom : t.creatingRoom}
              </span>
            </div>
          ) : (
            <div className="grid gap-5">
              {/* Join Room Section */}
              <div className="bg-stone-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-[2rem] border border-stone-200/40 dark:border-slate-800/50 shadow-inner">
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">{t.roomCodeLabel}</label>
                <div className="flex flex-col gap-2.5">
                  <input 
                    id="join-code-input"
                    placeholder={t.roomCodePlaceholder}
                    maxLength={6}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.currentTarget as HTMLInputElement).value;
                        if (val.trim().length === 6) joinRoom(val.trim().toUpperCase());
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-stone-200/50 dark:border-slate-700 px-4 py-3 rounded-2xl outline-none focus:border-emerald-500 dark:focus:border-emerald-500 text-center font-mono font-bold tracking-widest text-lg uppercase text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all shadow-sm" 
                  />
                  <button 
                    onClick={() => {
                      const val = (document.getElementById('join-code-input') as HTMLInputElement)?.value;
                      if (val.trim().length === 6) joinRoom(val.trim().toUpperCase());
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center shrink-0"
                  >
                    {t.joinRoomBtn}
                  </button>
                </div>
              </div>

              {/* Create Room Section */}
              <div className="bg-stone-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-[2rem] border border-stone-200/40 dark:border-slate-800/50 shadow-inner">
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">{t.roomNameLabel}</label>
                <div className="flex flex-col gap-2.5">
                  <input 
                    id="create-name-input"
                    placeholder={t.roomNamePlaceholder}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.currentTarget as HTMLInputElement).value;
                        if (val.trim()) createRoom(val.trim());
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-stone-200/50 dark:border-slate-700 px-4 py-3 rounded-2xl outline-none focus:border-emerald-500 dark:focus:border-emerald-500 font-bold text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" 
                  />
                  <button 
                    onClick={() => {
                      const val = (document.getElementById('create-name-input') as HTMLInputElement)?.value;
                      if (val.trim()) createRoom(val.trim());
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center shrink-0"
                  >
                    {t.createRoomBtn}
                  </button>
                </div>
              </div>

              {/* Recent Rooms List */}
              {recentRooms.length > 0 && (
                <div className="bg-stone-50/50 dark:bg-slate-800/20 p-4 sm:p-5 rounded-[2rem] border border-stone-200/40 dark:border-slate-800/50 shadow-inner flex flex-col gap-2.5 animate-in fade-in duration-300">
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t.recentRoomsTitle}</label>
                  <div className="flex flex-col gap-2">
                    {recentRooms.map(room => (
                      <div 
                        key={room.id}
                        onClick={() => joinRoom(room.id)}
                        className="bg-white/60 dark:bg-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-700/60 border border-stone-200/30 dark:border-slate-800/50 rounded-2xl p-3 sm:px-4 flex items-center justify-between shadow-sm hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Clock size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                          <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">{room.name}</span>
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full font-black text-slate-500 dark:text-slate-400 select-all">{room.id}</span>
                        </div>
                        <button
                          onClick={(e) => removeRecentRoom(e, room.id)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                          title={lang === 'zh' ? '清除此紀錄' : 'Remove record'}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Offline Mode Link */}
              <button 
                onClick={() => setRoomId("local")}
                className="w-full py-3.5 border-2 border-dashed border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/30 text-slate-500 dark:text-slate-400 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 hover:scale-[1.01] mb-2"
              >
                {t.localModeBtn}
              </button>

              {/* Capacitor Diagnostics Debug Panel */}
              {debugInfo && (
                <div className="text-[10px] text-center font-mono opacity-40 select-all max-w-full truncate px-2 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
                  {debugInfo}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-gradient-to-tr from-stone-100 via-emerald-50/15 to-amber-50/20 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-900 p-3 sm:p-4 pb-24 md:p-8 font-sans transition-all duration-500 ${theme}`}>
      <header className="flex justify-between items-center mb-4 sm:mb-6 max-w-2xl mx-auto bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-4 py-3 rounded-full border border-stone-200/40 dark:border-slate-800/40 shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shadow-inner shrink-0">
            <span className="text-2xl sm:text-2xl select-none">🍄</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase select-none leading-none mb-1">
              Pikmin Bloom Companion
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              {t.title.replace('🍄', '').trim()}
            </h1>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          {roomId === "local" && (
            <button 
              onClick={exitRoom} 
              className="px-3.5 py-2 bg-stone-200/50 hover:bg-stone-300/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-full shadow-sm text-slate-600 dark:text-slate-300 active:scale-95 hover:scale-102 transition-all font-bold flex items-center gap-1.5 text-xs border border-stone-200/10 shrink-0"
              title={lang === 'zh' ? '切換至共享房間模式' : 'Switch to Shared Room'}
            >
              <LogOut size={13} className="rotate-180 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'zh' ? '返回模式' : 'Switch Mode'}</span>
            </button>
          )}
          <button onClick={toggleTheme} className="p-2 sm:p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300 active:scale-95 hover:scale-105 transition-all hover:shadow-md border border-stone-200/10" title="切換主題">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="px-3 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300 active:scale-95 hover:scale-105 transition-all hover:shadow-md font-bold flex items-center gap-1.5 text-sm border border-stone-200/10">
             <Globe size={16} /> <span>{t.languageToggle}</span>
          </button>
          <button onClick={() => window.location.href='pikminbloom://'} className="p-2 sm:p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm text-emerald-600 dark:text-emerald-400 active:scale-95 hover:scale-105 transition-all hover:shadow-md border border-stone-200/10" title="開啟 Pikmin Bloom">
             <ExternalLink size={18} />
          </button>
        </div>
      </header>

      {/* Shared Room Info Bar */}
      {roomId && roomId !== "local" && (
        <div className="max-w-2xl mx-auto mb-6 bg-emerald-600 text-white p-4 rounded-3xl shadow-lg shadow-emerald-700/25 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3.5 animate-in slide-in-from-top-3 duration-300 relative overflow-hidden">
          {/* Subtle light flares */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-start">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Users2 size={18} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] opacity-75 uppercase tracking-widest font-extrabold select-none leading-none mb-1">
                {t.roomInfoTitle}
              </span>
              <span className="text-base font-black truncate max-w-[200px] leading-tight flex items-center gap-1.5">
                {roomName}
                {roomCreatorId === userId && (
                  <span className="bg-white/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90 origin-left shrink-0">
                    {t.roomCreator || "房主"}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start border-t border-white/10 pt-3 sm:pt-0 sm:border-none">
            <button 
              onClick={() => {
                copyToClipboard(roomId);
                setShowCodeCopyMessage(true);
                setTimeout(() => setShowCodeCopyMessage(false), 2000);
              }}
              className="flex items-center justify-center bg-black/15 hover:bg-black/25 px-3.5 py-1.5 rounded-full font-mono text-sm font-black transition-all active:scale-95 cursor-pointer text-white relative group min-w-[78px]"
              title={lang === 'zh' ? '點擊複製房間代碼' : 'Click to copy room code'}
            >
              {showCodeCopyMessage ? (
                <span className="text-xs text-emerald-300 font-sans font-extrabold flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                  <Check size={12} className="shrink-0" />
                  <span>{lang === 'zh' ? '已複製！' : 'Copied!'}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <span>{roomId}</span>
                  <Copy size={12} className="opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                </span>
              )}
            </button>
            
            <div className="flex gap-1.5">
              <button 
                onClick={() => {
                  const shareUrl = window.location.origin + window.location.pathname + `?room=${roomId}`;
                  copyToClipboard(shareUrl);
                  setShowCopyMessage(true);
                  setTimeout(() => setShowCopyMessage(false), 2000);
                }}
                className="px-3.5 py-1.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-full font-extrabold text-xs transition-all active:scale-95 hover:scale-102 flex items-center gap-1 shrink-0"
              >
                <Share2 size={12} />
                <span>{showCopyMessage ? t.copiedLink : t.copyLinkBtn}</span>
              </button>
              {roomCreatorId === userId && (
                <button 
                  onClick={deleteRoom}
                  className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all active:scale-95 hover:scale-105 shrink-0"
                  title={lang === 'zh' ? '刪除整個房間' : 'Delete entire room'}
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button 
                onClick={exitRoom}
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all active:scale-95 hover:scale-105 shrink-0"
                title={t.exitRoomBtn}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Alert Bar */}
      {warningMessage && (
        <div className="max-w-2xl mx-auto mb-4 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold px-4 py-2.5 rounded-2xl border border-rose-500/20 flex items-center justify-between animate-in slide-in-from-top-2 duration-200 shadow-sm">
          <span className="flex items-center gap-1.5">⚠️ {warningMessage}</span>
          <button onClick={() => setWarningMessage("")} className="text-rose-400 hover:text-rose-600 p-0.5 active:scale-90 transition-transform">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs / Groups Selection */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center gap-2 w-full py-2 -my-2 overflow-hidden">
        <div className="flex-1 flex flex-row gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2 -my-2 items-center">
          {groups.map(g => {
            const isEditingThis = editingGroupId === g.id;
            const isActive = activeGroupId === g.id;

            if (isEditingThis) {
              return (
                <div 
                  key={g.id} 
                  className="flex items-center bg-emerald-600 text-white px-4 rounded-full shadow-md h-[42px] animate-in zoom-in-95 duration-150 shrink-0"
                >
                  <input
                    type="text"
                    value={editGroupName}
                    onChange={e => setEditGroupName(e.target.value)}
                    onBlur={() => commitRenameGroup(g.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRenameGroup(g.id);
                      if (e.key === 'Escape') setEditingGroupId(null);
                    }}
                    className="w-24 sm:w-32 bg-transparent text-white font-bold outline-none text-base border-none p-0 focus:ring-0"
                    autoFocus
                  />
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commitRenameGroup(g.id)} 
                    className="text-white hover:text-emerald-200 ml-2.5 p-1 bg-white/10 rounded-lg active:scale-90 transition-transform flex items-center justify-center shrink-0"
                    title="確定"
                  >
                    <Check size={14} />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={g.id}
                onClick={() => handleSetActiveGroup(g.id)}
                onDoubleClick={() => startRenameGroup(g.id, g.name)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm h-[42px] shrink-0 relative group ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-102 hover:-translate-y-0.5 border border-stone-200/60 dark:border-slate-800/80'
                }`}
              >
                <MapPin size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{g.name}</span>
                
                {/* Micro-edit icon inside the active tab */}
                {isActive && (
                  <span 
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid switching tabs
                      startRenameGroup(g.id, g.name);
                    }}
                    className="p-0.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors cursor-pointer"
                    title={t.renameArea}
                  >
                    <Edit3 size={11} />
                  </span>
                )}

                {isActive && activeMushrooms.length > 0 && (
                  <span className="bg-white/30 text-[10px] px-1.5 py-0.5 rounded-md ml-0.5 font-extrabold">{activeMushrooms.length}</span>
                )}
              </button>
            );
          })}

          {/* Inline Add Button or Input */}
          {isAddingGroup ? (
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-emerald-500 shadow-sm animate-in zoom-in-95 duration-150 h-[42px] shrink-0">
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitAddGroup();
                  if (e.key === 'Escape') cancelAddGroup();
                }}
                placeholder={t.newArea}
                className="w-24 sm:w-32 bg-transparent text-slate-800 dark:text-slate-100 font-bold outline-none text-base placeholder:text-slate-400"
                autoFocus
              />
              <button onClick={commitAddGroup} className="text-emerald-500 hover:text-emerald-600 p-0.5 active:scale-90 transition-transform">
                <Check size={16} />
              </button>
              <button onClick={cancelAddGroup} className="text-rose-500 hover:text-rose-600 p-0.5 active:scale-90 transition-transform">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={startAddGroup}
              className="px-3.5 bg-stone-200/60 dark:bg-slate-800 text-stone-600 dark:text-slate-300 rounded-full hover:bg-stone-300/80 dark:hover:bg-slate-700 transition-all flex items-center gap-1 h-[42px] shrink-0 active:scale-95 hover:scale-103 font-bold text-xs shadow-sm border border-stone-300/20"
              title={t.newArea}
            >
              <Plus size={14} />
              <span>{lang === 'zh' ? '區域' : 'Area'}</span>
            </button>
          )}
        </div>

        {/* Inline Confirmation Trash Button */}
        {deleteConfirmGroupId === activeGroupId ? (
          <div className="flex items-center gap-2 bg-rose-500 text-white rounded-full shadow-md px-3 py-1 animate-in slide-in-from-right-2 duration-150 h-[42px] shrink-0">
            <span className="text-xs font-bold whitespace-nowrap">{t.confirmDelete}</span>
            <button 
              onClick={() => confirmDeleteGroup(activeGroupId)} 
              className="px-2.5 py-1 bg-white text-rose-600 rounded-full text-xs font-black hover:bg-slate-100 active:scale-90 transition-transform flex items-center justify-center h-7 px-3"
            >
              {t.deleteBtn}
            </button>
            <button 
              onClick={() => setDeleteConfirmGroupId(null)} 
              className="px-2.5 py-1 bg-white/20 text-white rounded-full text-xs font-black hover:bg-white/30 active:scale-90 transition-transform flex items-center justify-center h-7 px-3"
            >
              {t.cancel}
            </button>
          </div>
        ) : (
          <button 
             onClick={() => handleDeleteGroupClick(activeGroupId)}
             className={`p-2.5 rounded-full shadow-sm transition-all active:scale-95 hover:scale-105 h-[42px] w-[42px] flex items-center justify-center shrink-0 ${
               groups.length <= 1 
                 ? 'bg-slate-100 text-slate-300 dark:bg-slate-800/50 dark:text-slate-600 cursor-not-allowed' 
                 : 'bg-white dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50'
             }`}
             title={t.deleteTab}
             disabled={groups.length <= 1}
          >
            <Trash2 size={20} />
          </button>
        )}

        {/* Toggle Expand Button */}
        <button
          onClick={() => setIsGroupsExpanded(!isGroupsExpanded)}
          className={`p-2.5 rounded-full shadow-sm transition-all active:scale-95 hover:scale-105 h-[42px] w-[42px] flex items-center justify-center shrink-0 ${
            isGroupsExpanded
              ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
          title={t.expand}
        >
          <ChevronDown size={20} className={`transform transition-transform duration-300 ${isGroupsExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Grid View */}
      {isGroupsExpanded && (
        <div className="max-w-2xl mx-auto mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 pb-6 sm:pb-8 rounded-3xl shadow-xl animate-in slide-in-from-top-2 duration-200 w-full">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-500 dark:text-emerald-400" />
              {t.allAreas}
            </span>
            <button 
              onClick={() => setIsGroupsExpanded(false)} 
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.collapse}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {groups.map(g => {
              const isActive = activeGroupId === g.id;
              const groupMushrooms = mushrooms.filter(m => m.groupId === g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    handleSetActiveGroup(g.id);
                    setIsGroupsExpanded(false);
                  }}
                  className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-full border text-left transition-all active:scale-95 duration-150 h-12 w-full hover:scale-102 hover:-translate-y-0.5 ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-stone-200/60 dark:border-slate-800/80 shadow-sm text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={12} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
                    <span className="font-bold text-xs sm:text-sm truncate leading-none">{g.name}</span>
                  </div>
                  <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                  }`}>
                    {groupMushrooms.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 max-w-2xl mx-auto">
        {activeMushrooms.length === 0 && (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
            <Sparkles className="mx-auto mb-3 opacity-50" size={32} />
            <p className="font-bold text-slate-500 dark:text-slate-400">{t.noRecords(groups.find(g => g.id === activeGroupId)?.name || '')}</p>
            <p className="text-sm mt-1">{t.clickToAdd}</p>
          </div>
        )}
        {sortedMushrooms.map(m => (
          <MushroomItem 
            key={m.id} 
            m={m} 
            now={now} 
            lang={lang}
            isEditing={editingId === m.id}
            setEditingId={setEditingId}
            onDelete={deleteMushroom} 
            onUpdate={updateMushroom}
            onResetNote={() => {
              notifiedSet.current.delete(m.id + '_battle');
              notifiedSet.current.delete(m.id + '_respawn');
            }}
          />
        ))}
        {/* Scroll Spacer to prevent bottom-most card buttons from being blocked by FAB */}
        {activeMushrooms.length > 0 && (
          <div className="h-20 sm:h-24 select-none pointer-events-none" />
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAdding(true)}
        className={`fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-[0_12px_30px_rgba(16,185,129,0.45)] hover:shadow-[0_16px_35px_rgba(16,185,129,0.6)] flex items-center justify-center hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:bg-emerald-500 transition-all z-40 group ${editingId ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modern Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" onClick={() => setIsAdding(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-5 sm:p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto border border-stone-200/50 dark:border-slate-800/80">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 <Sparkles className="text-emerald-500" size={24} />
                 {t.addTo} {groups.find(g => g.id === activeGroupId)?.name}
              </h2>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid gap-5">
              <div>
                 <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">{t.mushroomName}</label>
                 <input id="quick-name" placeholder={t.mushroomNamePlaceholder} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all text-lg font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100" />
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">{t.participants}</label>
                 <ParticipantSlider value={addP} onChange={setAddP} />
              </div>

              <div>
                 <div className="flex justify-between items-center mb-2">
                   <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1"><Clock size={16}/> {t.remainingTime}</label>
                 </div>
                 <div className="flex flex-wrap gap-2 mb-3">
                   {[
                     { label: t.m15, h: 0, m: 15, s: 0 },
                     { label: t.m30, h: 0, m: 30, s: 0 },
                     { label: t.h1, h: 1, m: 0, s: 0 },
                     { label: t.h3, h: 3, m: 0, s: 0 },
                     { label: t.h8, h: 8, m: 0, s: 0 },
                   ].map(p => (
                     <button 
                       key={p.label}
                       onClick={() => {
                          setAddH(p.h);
                          setAddM(p.m);
                          setAddS(p.s);
                       }}
                       className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap active:scale-95 transition-all ${
                         addH === p.h && addM === p.m && addS === p.s
                           ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                           : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                       }`}
                     >
                       {p.label}
                     </button>
                   ))}
                 </div>
                 <KeyboardTimePicker
                    h={addH} m={addM} s={addS}
                    onChangeH={setAddH} onChangeM={setAddM} onChangeS={setAddS}
                    onEnter={handleAddSubmit}
                  />
               </div>
 
               <button 
                 id="start-tracking-btn"
                 onClick={handleAddSubmit}
                 className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
               >
                 <Plus size={24} /> {t.startTracking}
               </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MushroomItem({ m, now, lang, isEditing, setEditingId, onDelete, onUpdate, onResetNote }: { 
  m: Mushroom, 
  now: number, 
  lang: Lang,
  isEditing: boolean,
  setEditingId: (id: string | null) => void,
  onDelete: (id: string) => void, 
  onUpdate: (id: string, u: Partial<Mushroom>) => void,
  onResetNote: () => void
}) {
  const [editP, setEditP] = useState(m.participants);
  const [editName, setEditName] = useState(m.name);
  const [editH, setEditH] = useState(0);
  const [editM, setEditM] = useState(0);
  const [editS, setEditS] = useState(0);
  const [editTimeChanged, setEditTimeChanged] = useState(false);
  
  const t = T[lang];

  useEffect(() => {
    if (isEditing) {
      setEditP(m.participants);
      setEditName(m.name);
      // Pre-fill with current remaining time
      const remaining = Math.max(0, m.battleEndTime - Date.now());
      const totalSec = Math.floor(remaining / 1000);
      setEditH(Math.floor(totalSec / 3600));
      setEditM(Math.floor((totalSec % 3600) / 60));
      setEditS(totalSec % 60);
      setEditTimeChanged(false);
    }
  }, [isEditing, m.participants, m.name, m.battleEndTime]);

  const diff = m.endTime - now;
  const isOver = diff <= 0;
  const battleEnd = m.battleEndTime || (m.endTime - 5 * 60000);
  const isWaitingRespawn = !isOver && now >= battleEnd;

  const formatTime = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    return {
      h: Math.floor(totalSec / 3600).toString().padStart(2, '0'),
      m: Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0'),
      s: (totalSec % 60).toString().padStart(2, '0')
    };
  };

  const timeFmt = formatTime(diff);

  const handleEditSubmit = () => {
    const updates: Partial<Mushroom> = { 
      name: editName.trim() || t.defaultMushroom,
      participants: editP 
    };
    if (editTimeChanged) {
       const battleMs = (editH*3600 + editM*60 + editS)*1000;
       updates.battleEndTime = Date.now() + battleMs;
       updates.endTime = updates.battleEndTime + 5 * 60 * 1000;
       onResetNote();
    }
    onUpdate(m.id, updates);
    setEditingId(null);
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-sm border-2 border-blue-500 transition-all text-slate-800 dark:text-slate-100">
        <div className="mb-3">
          <input 
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg w-full font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 mb-3"
            placeholder={t.defaultMushroom}
          />
          <ParticipantSlider value={editP} onChange={setEditP} />
        </div>

        <div className="flex flex-col gap-2 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold mb-1 flex items-center gap-1"><Clock size={14} /> {t.resetTime}</div>
          <KeyboardTimePicker
            h={editH} m={editM} s={editS}
            onChangeH={v => { setEditH(v); setEditTimeChanged(true); }}
            onChangeM={v => { setEditM(v); setEditTimeChanged(true); }}
            onChangeS={v => { setEditS(v); setEditTimeChanged(true); }}
            onEnter={handleEditSubmit}
          />
        </div>

        <div className="flex gap-2">
          <button 
            id={`save-edit-btn-${m.id}`}
            onClick={handleEditSubmit}
            className="bg-emerald-600 text-white px-4 py-3 rounded-xl flex-1 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
          >
            <Check size={18} /> {t.saveChanges}
          </button>
          <button onClick={() => setEditingId(null)} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-3 rounded-xl font-bold active:scale-95 transition-transform focus:outline-none focus:ring-4 focus:ring-slate-500/20">
            {t.cancel}
          </button>
        </div>
      </div>
    );
  }

  let cardClass = "";
  if (isOver) {
    cardClass = "bg-white/70 dark:bg-slate-900/60 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-stone-200/50 dark:border-slate-800/60 shadow-sm opacity-90";
  } else if (isWaitingRespawn) {
    cardClass = "bg-gradient-to-br from-[#f8a532] to-[#e75a24] text-white shadow-lg shadow-orange-500/25 border border-orange-400/20";
  } else {
    cardClass = "bg-gradient-to-br from-[#809b7b] to-[#5d7c58] text-white shadow-md shadow-emerald-800/10 border border-emerald-700/20";
  }

  return (
    <div className={`p-5 rounded-3xl transition-all duration-300 ease-out hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.99] relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-4 ${cardClass}`}>
      <div className="flex flex-col items-start w-full sm:w-auto">
        <h3 className={`text-xl font-bold flex flex-wrap items-center gap-2 ${isOver ? 'text-slate-800 dark:text-slate-200' : 'text-white'}`}>
          {m.name}
          <span className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded-full font-normal shadow-sm ${isOver ? 'bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400' : 'bg-white/20 text-white'}`}>
            <Users size={14} /> {m.participants} {t.players}
          </span>
          {isWaitingRespawn && (
             <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
               {t.respawning}
             </span>
          )}
        </h3>
        <div className="mt-1">
          <p className={`text-xs flex items-center gap-1.5 ${isOver ? 'text-slate-600 dark:text-slate-400' : 'text-white/80'}`}>
            <Clock size={12} />
            {t.battleEnds}{new Date(battleEnd).toLocaleTimeString(lang === 'zh' ? 'zh-TW' : 'en-US')}
          </p>
          <p className={`text-xs flex items-center gap-1.5 mt-0.5 ${isOver ? 'text-slate-500 dark:text-slate-500' : 'text-white/60'}`}>
            <RotateCcw size={12} />
            {t.estRespawn}{new Date(m.endTime).toLocaleTimeString(lang === 'zh' ? 'zh-TW' : 'en-US')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between mt-2 sm:mt-0">
        <div className="flex gap-1 sm:gap-1.5 font-mono text-2xl sm:text-3xl font-bold">
          {isOver ? <span className="text-lg sm:text-xl flex items-center gap-2 text-slate-600 dark:text-slate-300 font-sans"><Sparkles size={20}/> {t.respawnComplete}</span> : (
            <>
              <div className="bg-white/15 px-1.5 sm:px-2 py-1 rounded-xl flex flex-col items-center min-w-[40px] sm:min-w-[50px]">
                <span className="text-xl sm:text-2xl">{timeFmt.h}</span>
              </div>
              <span className="opacity-60">:</span>
              <div className="bg-white/15 px-1.5 sm:px-2 py-1 rounded-xl flex flex-col items-center min-w-[40px] sm:min-w-[50px]">
                <span className="text-xl sm:text-2xl">{timeFmt.m}</span>
              </div>
              <span className="opacity-60">:</span>
              <div className="bg-white/15 px-1.5 sm:px-2 py-1 rounded-xl flex flex-col items-center min-w-[40px] sm:min-w-[50px]">
                <span className="text-xl sm:text-2xl">{timeFmt.s}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setEditingId(m.id)} className={`p-2 rounded-full active:scale-90 hover:scale-105 transition-all ${isOver ? 'bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-black/10 hover:bg-black/20'}`} title="編輯">
            <Edit3 size={18} />
          </button>
          <button onClick={() => onDelete(m.id)} className={`p-2 rounded-full active:scale-90 hover:scale-105 transition-all ${isOver ? 'bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-black/10 hover:bg-black/20'}`} title="刪除">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      {!isOver && (
        <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full overflow-hidden">
          <div 
            className="h-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-1000 ease-linear" 
            style={{ width: `${Math.min(100, Math.max(0, ((now - (m.startTime || now)) / Math.max(1, (m.battleEndTime - (m.startTime || now)))) * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
