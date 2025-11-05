import { ReactNode, useState } from "react";
import { Menu, X, Zap, Users, FolderTree, Contact, Send, CreditCard, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Send, label: "Disparos", path: "/messages" },
  { icon: FolderTree, label: "Categorias", path: "/categories" },
  { icon: Contact, label: "Contatos", path: "/contacts" },
  { icon: Users, label: "Usuários", path: "/users", adminOnly: true },
  { icon: CreditCard, label: "Pagamentos", path: "/payments", adminOnly: true },
];

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin: isUserAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...');
      await signOut();
      console.log('SignOut executado, navegando para /');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, tentar navegar
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Hamburger - Esquerda (apenas mobile/tablet) */}
          <div className="flex justify-start lg:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden bg-primary/20 hover:bg-primary/30"
            >
              {sidebarOpen ? <X className="text-primary" /> : <Menu className="text-primary" />}
            </Button>
          </div>
          
          {/* Logo - Centro */}
          <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold text-foreground whitespace-nowrap">Auto Trigger</span>
          </div>
          
          {/* Theme Toggle e Logout - Direita */}
          <div className="flex items-center gap-2 justify-end lg:w-auto">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-primary/20 hover:bg-primary/30"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 w-64 glass-card border-r border-white/10 transition-transform duration-300 z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            if (item.adminOnly && !isUserAdmin) return null;
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
