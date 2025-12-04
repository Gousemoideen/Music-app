import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  Firestore 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithCustomToken, 
  Auth, 
  User 
} from 'firebase/auth';
import { 
  Heart, 
  Flame, 
  Plus, 
  CheckCircle, 
  Circle, 
  Calendar, 
  Gift, 
  Utensils, 
  Moon, 
  Video, 
  LayoutDashboard, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';

// --- Types ---

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

declare global {
  var __firebase_config: FirebaseConfig | undefined;
  var __app_id: string | undefined;
  var __initial_auth_token: string | undefined;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  lastCompletionDate: string | null; // YYYY-MM-DD
  createdAt: number;
}

interface GameData {
  kisses: number;
  currentStreak: number;
  lastCompletionDate: string | null; // YYYY-MM-DD
}

interface GiftItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
}

// --- Configuration & Utils ---

const getAppId = () => window.__app_id || 'loveloop-default';
const getTodayDateString = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA');
};

// --- Firebase Initialization ---

let db: Firestore;
let auth: Auth;
let firebaseInitialized = false;

try {
  // Safe config fallback to prevent "projectId missing" crash
  const config = window.__firebase_config || {
    apiKey: "mock-key",
    authDomain: "mock.firebaseapp.com",
    projectId: "mock-project", 
    storageBucket: "mock.appspot.com",
    messagingSenderId: "000000",
    appId: "1:000000:web:000000"
  };

  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  firebaseInitialized = true;
} catch (error) {
  console.error("Firebase init failed:", error);
}

// Helper to ensure auth
const initializeAuth = async () => {
  if (!firebaseInitialized) return;
  if (window.__initial_auth_token) {
    try {
      await signInWithCustomToken(auth, window.__initial_auth_token);
    } catch (e) {
      console.error("Auth failed", e);
    }
  }
};

// --- Components ---

// 1. Kiss Counter
const KissCounter: React.FC<{ count: number; trigger: boolean }> = ({ count, trigger }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 600);
      return () => clearTimeout(t);
    }
  }, [trigger, count]);

  return (
    <div className="flex items-center justify-center space-x-2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg shadow-rose-200/50 border border-rose-100 sticky top-4 z-30 mx-auto w-max transition-transform duration-300 hover:scale-105">
      <Heart 
        className={`w-8 h-8 text-rose-500 fill-rose-500 drop-shadow-sm ${animating ? 'animate-wiggle' : ''}`} 
      />
      <span className="text-4xl font-bold text-rose-600 font-mono tracking-tighter drop-shadow-sm">
        {count}
      </span>
      <span className="text-rose-400 text-xs font-bold uppercase tracking-widest ml-1 pt-2">Kisses</span>
    </div>
  );
};

// 2. Streak Display
const StreakDisplay: React.FC<{ streak: number }> = ({ streak }) => {
  return (
    <div className="flex items-center space-x-1.5 bg-orange-50/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-orange-100 text-orange-600 shadow-sm">
      <Flame className={`w-5 h-5 ${streak > 0 ? 'fill-orange-500 text-orange-600 animate-pulse' : 'text-orange-300'}`} />
      <span className="font-bold text-xl font-mono">{streak}</span>
      <span className="text-[10px] font-bold uppercase text-orange-400 tracking-wider">Day Streak</span>
    </div>
  );
};

// 3. Dashboard View
const DashboardView: React.FC<{ 
  tasks: Task[]; 
  onAdd: (t: string) => void; 
  onToggle: (t: Task) => void; 
}> = ({ tasks, onAdd, onToggle }) => {
  const [title, setTitle] = useState('');
  const today = getTodayDateString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title);
      setTitle('');
    }
  };

  const isDoneToday = (t: Task) => t.completed && t.lastCompletionDate === today;

  const sortedTasks = [...tasks].sort((a, b) => {
    const aDone = isDoneToday(a);
    const bDone = isDoneToday(b);
    if (aDone === bDone) return b.createdAt - a.createdAt;
    return aDone ? 1 : -1;
  });

  return (
    <div className="space-y-6 animate-pop pb-24">
      {/* Add Goal */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-rose-100 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-300 to-pink-400" />
        <h2 className="text-lg font-bold text-rose-800 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-rose-400" />
          New Aspiration
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-3 relative z-10">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's our goal today?"
            className="flex-1 px-5 py-3.5 rounded-2xl border border-rose-100 bg-rose-50/30 text-rose-900 placeholder:text-rose-300/80 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="bg-gradient-to-br from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-2xl shadow-md shadow-rose-200 transition-all duration-300 flex items-center justify-center aspect-square"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        <h3 className="text-rose-900/50 font-bold px-2 text-xs uppercase tracking-widest">Today's Goals</h3>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white/50 rounded-3xl border border-dashed border-rose-200">
            <p className="text-rose-300 italic">No goals set yet.<br/>Let's achieve something beautiful!</p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const completed = isDoneToday(task);
            return (
              <div
                key={task.id}
                onClick={() => onToggle(task)}
                className={`group flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 cursor-pointer select-none relative overflow-hidden ${
                  completed
                    ? 'bg-rose-50/50 border-transparent opacity-75'
                    : 'bg-white border-rose-100 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100/50 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center space-x-4 relative z-10 w-full">
                  <div className={`transition-all duration-500 ${completed ? 'text-rose-500 scale-110' : 'text-rose-200 group-hover:text-rose-400'}`}>
                    {completed ? <CheckCircle className="w-7 h-7 fill-rose-100" /> : <Circle className="w-7 h-7" />}
                  </div>
                  <span className={`text-lg font-medium transition-all duration-300 flex-1 ${completed ? 'text-rose-300 line-through decoration-rose-200' : 'text-rose-700'}`}>
                    {task.title}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// 4. Store View
const StoreView: React.FC<{ kisses: number; onRedeem: (g: GiftItem) => void }> = ({ kisses, onRedeem }) => {
  const gifts: GiftItem[] = [
    { id: 'dinner', name: 'Romantic Dinner', cost: 100, icon: 'utensils' },
    { id: 'massage', name: 'Full Body Massage', cost: 150, icon: 'moon' },
    { id: 'movie', name: 'Movie Night', cost: 50, icon: 'video' },
  ];

  const getIcon = (name: string) => {
    const cls = "w-6 h-6 text-white";
    switch (name) {
      case 'utensils': return <Utensils className={cls} />;
      case 'moon': return <Moon className={cls} />;
      case 'video': return <Video className={cls} />;
      default: return <Gift className={cls} />;
    }
  };

  return (
    <div className="space-y-6 animate-pop pb-24">
      <div className="bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 p-8 rounded-[2rem] shadow-xl shadow-rose-300/40 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <h2 className="text-2xl font-bold mb-2 relative z-10">Rewards Store</h2>
        <p className="text-rose-100 relative z-10 font-medium">Treat yourself, you've earned it!</p>
      </div>

      <div className="grid gap-4">
        {gifts.map((gift) => {
          const canAfford = kisses >= gift.cost;
          return (
            <div
              key={gift.id}
              className={`relative bg-white p-5 rounded-[2rem] border transition-all duration-300 flex items-center justify-between ${
                canAfford 
                  ? 'border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300' 
                  : 'border-gray-100 opacity-70 grayscale-[0.5] bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-2xl shadow-inner ${canAfford ? 'bg-rose-400 shadow-rose-600/20' : 'bg-gray-300'}`}>
                  {getIcon(gift.icon)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{gift.name}</h3>
                  <p className="text-sm text-rose-500 font-bold">{gift.cost} Kisses</p>
                </div>
              </div>
              
              <button
                onClick={() => canAfford && onRedeem(gift)}
                disabled={!canAfford}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  canAfford
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white shadow-sm'
                    : 'bg-transparent text-gray-400 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'Redeem' : 'Locked'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Application ---

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gameData, setGameData] = useState<GameData>({ kisses: 0, currentStreak: 0, lastCompletionDate: null });
  const [view, setView] = useState<'dashboard' | 'store'>('dashboard');
  const [animTrigger, setAnimTrigger] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; title: string; msg: string; type: 'success'|'error' }>(
    { open: false, title: '', msg: '', type: 'success' }
  );

  // Initialize Data
  useEffect(() => {
    const init = async () => {
      if (!firebaseInitialized) {
        // If no config, we stop loading but remain in "demo/broken" state visually
        setLoading(false);
        return;
      }
      await initializeAuth();
      const u = auth.currentUser || { uid: 'demo-user' }; // Fallback for strict mode / dev
      setUser(u);
    };
    init();
  }, []);

  // Listeners
  useEffect(() => {
    if (!user || !firebaseInitialized) return;
    
    const uid = user.uid;
    const appId = getAppId();
    const userPath = `artifacts/${appId}/users/${uid}`;
    
    // 1. Game Data
    const gameRef = doc(db, `${userPath}/game_data`);
    const unsubGame = onSnapshot(gameRef, (snap) => {
      if (snap.exists()) setGameData(snap.data() as GameData);
      else setDoc(gameRef, { kisses: 0, currentStreak: 0, lastCompletionDate: null });
    }, (err) => console.error("Game sync error", err));

    // 2. Tasks
    const tasksRef = collection(db, `${userPath}/tasks`);
    const q = query(tasksRef);
    const unsubTasks = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
      setLoading(false);
    }, (err) => console.error("Tasks sync error", err));

    return () => { unsubGame(); unsubTasks(); };
  }, [user]);

  // Logic
  const handleAddTask = async (title: string) => {
    if (!firebaseInitialized || !user) return;
    const appId = getAppId();
    await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/tasks`), {
      title,
      completed: false,
      lastCompletionDate: null,
      createdAt: Date.now()
    });
  };

  const handleToggle = async (task: Task) => {
    if (!firebaseInitialized || !user) return;
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    const appId = getAppId();
    const userPath = `artifacts/${appId}/users/${user.uid}`;
    
    // Reference
    const taskRef = doc(db, `${userPath}/tasks/${task.id}`);
    const gameRef = doc(db, `${userPath}/game_data`);

    // Case 1: Task done today? (User unchecking)
    if (task.completed && task.lastCompletionDate === today) {
      // Uncheck, but don't refund (prevents abuse). 
      // We keep lastCompletionDate as today to prevent re-checking for double points.
      await updateDoc(taskRef, { completed: false });
      return;
    }

    // Case 2: Task done in past or new check
    // We consider it a new completion for today.
    
    // Logic: Streak & Rewards
    let { currentStreak, lastCompletionDate, kisses } = gameData;
    let bonus = 0;

    if (lastCompletionDate === today) {
      // Already active today, no streak change
    } else if (lastCompletionDate === yesterday) {
      currentStreak += 1;
      bonus = 5 * Math.min(currentStreak, 5);
    } else {
      currentStreak = 1; // Reset
    }

    const base = 10;
    const total = base + bonus;

    // Updates
    await updateDoc(taskRef, { completed: true, lastCompletionDate: today });
    await updateDoc(gameRef, { 
      kisses: kisses + total, 
      currentStreak, 
      lastCompletionDate: today 
    });

    // Feedback
    setAnimTrigger(p => !p);
    showModal(
      `Reward Unlocked! 💋`, 
      `You earned ${base} Kisses!${bonus > 0 ? `\n+ ${bonus} Streak Bonus!` : ''}`, 
      'success'
    );
  };

  const handleRedeem = async (gift: GiftItem) => {
    if (!firebaseInitialized || !user) return;
    if (gameData.kisses < gift.cost) return; // Should be disabled in UI anyway
    
    if (window.confirm(`Redeem "${gift.name}" for ${gift.cost} Kisses?`)) {
       const appId = getAppId();
       const gameRef = doc(db, `artifacts/${appId}/users/${user.uid}/game_data`);
       await updateDoc(gameRef, { kisses: gameData.kisses - gift.cost });
       showModal('Redeemed! 🎁', `Enjoy your ${gift.name}, darling!`, 'success');
    }
  };

  const showModal = (title: string, msg: string, type: 'success'|'error') => {
    setModal({ open: true, title, msg, type });
    if (type === 'success') setTimeout(() => setModal(m => ({ ...m, open: false })), 2500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-rose-50 text-rose-400 font-bold animate-pulse">Loading LoveLoop...</div>;

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-2xl overflow-hidden flex flex-col font-sans selection:bg-rose-200 relative">
      
      {/* Header */}
      <div className="bg-gradient-to-b from-rose-100 to-rose-50 pt-8 pb-10 px-6 rounded-b-[2.5rem] shadow-sm z-10 relative">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-black text-rose-900 tracking-tight">LoveLoop</h1>
          <StreakDisplay streak={gameData.currentStreak} />
        </div>
        <KissCounter count={gameData.kisses} trigger={animTrigger} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 -mt-6 pt-8 z-0 bg-white">
        {!firebaseInitialized && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 text-center">
            Running in demo mode (No Database Config)
          </div>
        )}
        
        {view === 'dashboard' 
          ? <DashboardView tasks={tasks} onAdd={handleAddTask} onToggle={handleToggle} />
          : <StoreView kisses={gameData.kisses} onRedeem={handleRedeem} />
        }
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-rose-100 p-4 pb-6 flex justify-around items-center shadow-[0_-10px_40px_rgba(255,228,230,0.5)] z-20 rounded-t-[2rem]">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center space-y-1 transition-all duration-300 ${view === 'dashboard' ? 'text-rose-600 scale-110' : 'text-rose-300 hover:text-rose-400'}`}
        >
          <LayoutDashboard className={`w-6 h-6 ${view === 'dashboard' ? 'fill-rose-100 stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-wide">Goals</span>
        </button>
        
        <div className="w-px h-8 bg-rose-100/50"></div>

        <button 
          onClick={() => setView('store')}
          className={`flex flex-col items-center space-y-1 transition-all duration-300 ${view === 'store' ? 'text-rose-600 scale-110' : 'text-rose-300 hover:text-rose-400'}`}
        >
          <ShoppingBag className={`w-6 h-6 ${view === 'store' ? 'fill-rose-100 stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-wide">Store</span>
        </button>
      </div>

      {/* Modal Overlay */}
      {modal.open && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-8 bg-rose-900/10 backdrop-blur-sm animate-pop">
          <div className="bg-white rounded-[2rem] p-8 shadow-2xl w-full text-center transform transition-all border border-white/50">
             <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${modal.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
               {modal.type === 'success' ? '✨' : '⚠️'}
             </div>
             <h3 className="text-xl font-black text-gray-800 mb-2">{modal.title}</h3>
             <p className="text-gray-500 mb-8 font-medium whitespace-pre-line leading-relaxed">{modal.msg}</p>
             <button 
              onClick={() => setModal(m => ({ ...m, open: false }))}
              className="w-full py-3.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
             >
               Close
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
