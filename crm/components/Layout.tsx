import React from 'react';
import { 
  BarChart3, 
  Users, 
  Package, 
  Truck, 
  Wallet, 
  LayoutDashboard,
  Search,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onSetActiveTab: (tab: string) => void;
  onOpenCapture: () => void;
}

export const Layout: React.FC<Props> = ({ children, activeTab, onSetActiveTab, onOpenCapture }) => {
  return (
    <div className="flex h-screen bg-[#05080f] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0f19] flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              GROWTH OS
            </h1>
            <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Textile CRM</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem icon={<BarChart3 size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => onSetActiveTab('dashboard')} />
          <NavItem icon={<LayoutDashboard size={18} />} label="Ventas (Kanban)" active={activeTab === 'sales'} onClick={() => onSetActiveTab('sales')} />
          <NavItem icon={<Users size={18} />} label="Contactos" active={activeTab === 'contacts'} onClick={() => onSetActiveTab('contacts')} />
          <NavItem icon={<Package size={18} />} label="Inventario" active={activeTab === 'inventory'} onClick={() => onSetActiveTab('inventory')} />
          <NavItem icon={<Truck size={18} />} label="Logística" active={activeTab === 'logistics'} onClick={() => onSetActiveTab('logistics')} />
          <NavItem icon={<Wallet size={18} />} label="Finanzas" active={activeTab === 'finance'} onClick={() => onSetActiveTab('finance')} />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <NavItem icon={<Settings size={18} />} label="Configuración" onClick={() => onSetActiveTab('settings')} active={activeTab === 'settings'} />
          <NavItem icon={<LogOut size={18} />} label="Cerrar Sesión" onClick={() => console.log('logout')} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.01] backdrop-blur-md z-10">
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5 w-96">
            <Search size={16} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar clientes, máquinas, pedidos..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={onOpenCapture}
              className="hidden md:flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/20 transition-all group"
            >
              <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Captura IA</span>
            </button>

            <div className="relative">
              <Bell size={20} className="text-slate-400 cursor-pointer hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-white/5">
              <div className="text-right">
                <p className="text-xs font-bold">Robin Huerta</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-indigo-400">
                RH
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-tr from-[#05080f] via-[#05080f] to-[#0a1120]">
           {children}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer group transition-all duration-200 ${active ? 'bg-indigo-500/10 text-white border border-indigo-500/20 shadow-lg shadow-indigo-500/5' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
  >
    <div className="flex items-center gap-3">
      <div className={`${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
        {icon}
      </div>
      <span className="text-sm font-medium tracking-tight">{label}</span>
    </div>
    {active && <ChevronRight size={14} className="text-indigo-400" />}
  </div>
);
