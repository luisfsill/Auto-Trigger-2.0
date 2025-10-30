import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  webhookUrl: string;
  isActive: boolean;
  planExpiry: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@example.com",
    webhookUrl: "https://n8n.example.com/webhook/user1",
    isActive: true,
    planExpiry: "2025-02-15",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@example.com",
    webhookUrl: "https://n8n.example.com/webhook/user2",
    isActive: false,
    planExpiry: "2024-12-20",
  },
];

export const Users = () => {
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground mt-1">
              Administre usuários, planos e webhooks
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <Card className="glass-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-white/10"
            />
          </div>
        </Card>

        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="glass-card p-6 hover-lift"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <Badge
                      variant={user.isActive ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {user.isActive ? "Ativo" : "Bloqueado"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Webhook URL:</p>
                    <code className="text-xs bg-secondary/50 px-2 py-1 rounded">
                      {user.webhookUrl}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Plano expira em: {new Date(user.planExpiry).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="action"
                    size="icon"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={user.isActive ? "action-destructive" : "action"}
                    size="icon"
                  >
                    {user.isActive ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="action-destructive"
                    size="icon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};
