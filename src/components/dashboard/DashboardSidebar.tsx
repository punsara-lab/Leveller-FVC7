import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Target, 
  Dumbbell, 
  BookOpen, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Brain,
  Activity,
  Flame,
  Skull,
  Cpu,
  RefreshCw

} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  section?: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Dashboard', section: 'dashboard' },
  { icon: Activity, label: 'ARC', section: 'arc' },
  { icon: Flame, label: 'The Build', section: 'build' },
  { icon: Skull, label: 'The Cost', section: 'cost' },
  { icon: Cpu, label: 'FVC7 Core', section: 'core' },
  { icon: Target, label: 'Tasks', section: 'tasks' },
  { icon: Dumbbell, label: 'Training', section: 'training' },
  { icon: BookOpen, label: 'Study', section: 'study' },
  { icon: BarChart3, label: 'Analytics', section: 'analytics' },
  { icon: Brain, label: 'Mindset', path: '/spiritual' },
  { icon: Activity, label: 'Physical', path: '/physical' },
  { icon: RefreshCw, label: 'Device Sync', section: 'sync' },

  { icon: Settings, label: 'Settings', section: 'settings' },
];

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (item: SidebarItem) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.section) {
      onSectionChange(item.section);
    }
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-card/95 backdrop-blur-xl border-r border-primary/20 z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-16 lg:w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-primary/20">
        {!collapsed && (
          <div className="hidden lg:flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary animate-pulse" />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FVC7
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="p-2 lg:p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
        {sidebarItems.map((item) => {
          const isActive = item.section === activeSection || item.path === location.pathname;
          return (
            <button
              key={item.label}
              title={item.label}
              aria-label={item.label}
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-primary/20 text-primary shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                isActive && "scale-110",
                "group-hover:scale-110"
              )} />
              {!collapsed && (
                <span className="hidden lg:inline font-medium text-sm">{item.label}</span>
              )}
              {isActive && !collapsed && (
                 <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <div className="hidden lg:block absolute bottom-4 left-4 right-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <div className="text-xs text-muted-foreground mb-1">System Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-foreground">All Systems Online</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
