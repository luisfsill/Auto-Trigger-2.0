import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Send, 
  Calendar, 
  TrendingUp, 
  Mail, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalContacts: number;
  messagesDay: number;
  messagesWeek: number;
  messagesMonth: number;
  accountStatus: "active" | "expired";
  accountExpiry: string;
  userEmail: string;
}

export const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    messagesDay: 0,
    messagesWeek: 0,
    messagesMonth: 0,
    accountStatus: "active",
    accountExpiry: "",
    userEmail: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Usar usuário do contexto
      if (!user) {
        console.log('Sem usuário autenticado');
        return;
      }

      // Total de contatos
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Data atual e datas de referência
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Mensagens do dia
      const { count: messagesDay } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today);

      // Mensagens da semana
      const { count: messagesWeek } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekAgo);

      // Mensagens do mês
      const { count: messagesMonth } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', monthAgo);

      // Buscar último pagamento ativo (com tratamento de erro)
      let lastPayment = null;
      try {
        const { data } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .order('due_date', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        lastPayment = data;
      } catch (error) {
        console.log('Tabela payments não existe ou erro ao buscar:', error);
      }

      // Verificar status da conta
      const accountStatus = lastPayment && new Date(lastPayment.due_date) > now 
        ? "active" 
        : "expired";

      setStats({
        totalContacts: contactsCount || 0,
        messagesDay: messagesDay || 0,
        messagesWeek: messagesWeek || 0,
        messagesMonth: messagesMonth || 0,
        accountStatus,
        accountExpiry: lastPayment?.expiry_date || "",
        userEmail: user.email || ""
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isAccountActive = stats.accountStatus === "active";

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu sistema
          </p>
        </div>

        {/* Status da Conta */}
        <Card className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isAccountActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {isAccountActive ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">Status da Conta</h3>
                <p className="text-sm text-muted-foreground">
                  {isAccountActive ? 'Conta ativa e funcionando' : 'Conta vencida - Renovar pagamento'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1">
              <Badge 
                variant={isAccountActive ? "default" : "destructive"}
                className="text-sm"
              >
                {isAccountActive ? 'Ativa' : 'Vencida'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Validade: {new Date(stats.accountExpiry).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        {/* Informações do Usuário */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/20">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Usuário Logado</h3>
              <p className="text-muted-foreground">{stats.userEmail}</p>
            </div>
          </div>
        </Card>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total de Contatos */}
          <Card className="glass-card p-3 md:p-6 hover-lift">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-full bg-primary/20">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Total de Contatos</p>
                <p className="text-2xl md:text-3xl font-bold">{stats.totalContacts}</p>
              </div>
            </div>
          </Card>

          {/* Mensagens Hoje */}
          <Card className="glass-card p-3 md:p-6 hover-lift">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-full bg-accent/20">
                <Send className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Mensagens Hoje</p>
                <p className="text-2xl md:text-3xl font-bold">{stats.messagesDay}</p>
              </div>
            </div>
          </Card>

          {/* Mensagens Semana */}
          <Card className="glass-card p-3 md:p-6 hover-lift">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-full bg-green-500/20">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Mensagens (7 dias)</p>
                <p className="text-2xl md:text-3xl font-bold">{stats.messagesWeek}</p>
              </div>
            </div>
          </Card>

          {/* Mensagens Mês */}
          <Card className="glass-card p-3 md:p-6 hover-lift">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-full bg-blue-500/20">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Mensagens (30 dias)</p>
                <p className="text-2xl md:text-3xl font-bold">{stats.messagesMonth}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráfico de Atividade Resumido */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Resumo de Atividade</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span className="text-sm text-muted-foreground">Média diária</span>
              </div>
              <span className="font-semibold">{Math.round(stats.messagesMonth / 30)} mensagens</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Média semanal</span>
              </div>
              <span className="font-semibold">{Math.round(stats.messagesMonth / 4)} mensagens</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Total de contatos</span>
              </div>
              <span className="font-semibold">{stats.totalContacts} contatos</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
