import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Edit, Trash2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UserWithRole {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
  role: 'admin' | 'user';
}

interface EditUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export const Users = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { isAdmin: isUserAdmin } = useAuth();
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editFormData, setEditFormData] = useState<EditUserData>({
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isUserAdmin) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [isUserAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Buscar perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, created_at');

      if (profilesError) throw profilesError;

      // Buscar roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Mapear roles por user_id
      const rolesMap = new Map<string, 'admin' | 'user'>();
      if (rolesData) {
        rolesData.forEach((role: any) => {
          rolesMap.set(role.user_id, role.role);
        });
      }

      // Combinar dados
      const usersWithRoles: UserWithRole[] = (profilesData || []).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        role: rolesMap.get(user.id) || 'user',
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await (supabase
        .from('user_roles') as any)
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Role atualizada",
        description: "O papel do usuário foi atualizado com sucesso.",
      });

      loadUsers();
      setEditingUser(null);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditModal = (user: UserWithRole) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditFormData({
      name: "",
      email: "",
      password: "",
      role: "user"
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      // Atualizar perfil
      const { error: profileError } = await (supabase
        .from('profiles') as any)
        .update({
          name: editFormData.name,
          email: editFormData.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      // Atualizar role
      const { error: roleError } = await (supabase
        .from('user_roles') as any)
        .update({ role: editFormData.role })
        .eq('user_id', editingUser.id);

      if (roleError) throw roleError;

      // Atualizar email e senha no auth (se necessário)
      if (editFormData.email !== editingUser.email || editFormData.password) {
        const updateData: any = {};
        
        if (editFormData.email !== editingUser.email) {
          updateData.email = editFormData.email;
        }
        
        if (editFormData.password) {
          updateData.password = editFormData.password;
        }

        const { error: authError } = await supabase.auth.admin.updateUserById(
          editingUser.id,
          updateData
        );

        if (authError) throw authError;
      }

      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso.",
      });

      loadUsers();
      closeEditModal();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(deleteUserId);

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso.",
      });

      loadUsers();
      setDeleteUserId(null);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      default:
        return 'Usuário';
    }
  };

  if (!isUserAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Card className="glass-card p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground mt-1">
              Administre usuários e suas permissões
            </p>
          </div>
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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando usuários...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="glass-card p-6 hover-lift"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{user.name || 'Sem nome'}</h3>
                      <Badge
                        variant={getRoleBadgeVariant(user.role)}
                        className="text-xs"
                      >
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="action"
                      size="icon"
                      onClick={() => openEditModal(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="action-destructive"
                      size="icon"
                      onClick={() => setDeleteUserId(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Edição */}
        <Dialog open={!!editingUser} onOpenChange={closeEditModal}>
          <DialogContent className="glass-card sm:max-w-[500px] border border-white/10 bg-card/95 backdrop-blur-xl">
            <DialogHeader className="border-b border-white/10 pb-4">
              <DialogTitle className="text-2xl font-bold text-foreground">Editar Usuário</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Atualize as informações do usuário abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-foreground font-medium">Nome</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="glass-card bg-secondary/30 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
                  placeholder="Nome completo"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="glass-card bg-secondary/30 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password" className="text-foreground font-medium">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="glass-card bg-secondary/30 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
                  placeholder="Deixe em branco para manter a atual"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 6 caracteres. Deixe vazio para não alterar.
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="role" className="text-foreground font-medium">Permissão</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value: 'admin' | 'user') => 
                    setEditFormData({ ...editFormData, role: value })
                  }
                >
                  <SelectTrigger className="glass-card bg-secondary/30 border-white/20 text-foreground focus:border-primary/50 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card bg-card/95 backdrop-blur-xl border-white/10">
                    <SelectItem value="user" className="text-foreground focus:bg-primary/20 focus:text-foreground">Usuário</SelectItem>
                    <SelectItem value="admin" className="text-foreground focus:bg-primary/20 focus:text-foreground">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="border-t border-white/10 pt-4 gap-2">
              <Button 
                variant="outline" 
                onClick={closeEditModal}
                className="glass-card bg-secondary/30 border-white/20 text-foreground hover:bg-secondary/50 hover:border-white/30"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveUser}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent className="glass-card bg-card/95 backdrop-blur-xl border border-white/10">
            <AlertDialogHeader className="border-b border-white/10 pb-4">
              <AlertDialogTitle className="text-2xl font-bold text-foreground">Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="border-t border-white/10 pt-4 gap-2">
              <AlertDialogCancel className="glass-card bg-secondary/30 border-white/20 text-foreground hover:bg-secondary/50 hover:border-white/30">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};