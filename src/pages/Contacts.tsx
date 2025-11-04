import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Upload, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  category_id: string | null;
  category_name?: string;
}

const mockContacts: Contact[] = [];

export const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          name,
          phone,
          email,
          category_id,
          categories(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const contactsWithCategory: Contact[] = (data || []).map((contact: any) => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        category_id: contact.category_id,
        category_name: contact.categories?.name || 'Sem categoria',
      }));

      setContacts(contactsWithCategory);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar contatos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteContactId) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', deleteContactId);

      if (error) throw error;

      toast({
        title: "Contato excluído",
        description: "O contato foi removido com sucesso.",
      });

      loadContacts();
      setDeleteContactId(null);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir contato",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contatos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie sua base de contatos
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-primary/30 bg-primary/10 hover:bg-primary/20 text-foreground flex-1 md:flex-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                vCard
              </Button>
              <Button
                variant="outline"
                className="border-primary/30 bg-primary/10 hover:bg-primary/20 text-foreground flex-1 md:flex-none"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        <Card className="glass-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-white/10"
            />
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando contatos...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <p className="text-muted-foreground">Nenhum contato encontrado.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="glass-card p-6 hover-lift"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{contact.name}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="action"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="action-destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteContactId(contact.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    {contact.email && (
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    )}
                  </div>

                  <Badge className="bg-primary/20 text-primary">
                    {contact.category_name}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteContactId} onOpenChange={() => setDeleteContactId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteContact}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};
