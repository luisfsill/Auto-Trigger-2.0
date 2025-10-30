import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
  planMonths: number;
}

const mockPayments: Payment[] = [
  {
    id: "1",
    userId: "1",
    userName: "João Silva",
    amount: 99.90,
    dueDate: "2025-02-15",
    paidDate: "2025-01-10",
    status: "paid",
    planMonths: 1,
  },
  {
    id: "2",
    userId: "2",
    userName: "Maria Santos",
    amount: 99.90,
    dueDate: "2024-12-20",
    status: "overdue",
    planMonths: 1,
  },
];

export const Payments = () => {
  const [payments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.userName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    paid: {
      label: "Pago",
      variant: "default" as const,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    pending: {
      label: "Pendente",
      variant: "secondary" as const,
      icon: Calendar,
      color: "text-yellow-500",
    },
    overdue: {
      label: "Vencido",
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-red-500",
    },
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Controle de Pagamentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie pagamentos e planos dos usuários
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Pagamento
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Buscar por usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary/50 border-white/10"
              />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-secondary/50 border-white/10">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>

        <div className="grid gap-4">
          {filteredPayments.map((payment) => {
            const config = statusConfig[payment.status];
            const Icon = config.icon;

            return (
              <Card key={payment.id} className="glass-card p-4 md:p-6 hover-lift">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-semibold truncate">
                        {payment.userName}
                      </h3>
                      <Badge variant={config.variant} className="text-xs flex-shrink-0">
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Valor</p>
                        <p className="font-semibold text-sm">
                          R$ {payment.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Vencimento</p>
                        <p className="font-semibold text-sm">
                          {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Plano</p>
                        <p className="font-semibold text-sm">
                          {payment.planMonths}{" "}
                          {payment.planMonths === 1 ? "mês" : "meses"}
                        </p>
                      </div>
                      {payment.paidDate && (
                        <div>
                          <p className="text-muted-foreground text-xs">Pago em</p>
                          <p className="font-semibold text-sm">
                            {new Date(payment.paidDate).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {payment.status !== "paid" && (
                      <Button
                        variant="outline"
                        className="border-white/10 hover:bg-primary/10 text-sm"
                      >
                        Confirmar Pagamento
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-primary/10 text-sm"
                    >
                      Ajustar Plano
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};
