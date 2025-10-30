import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Upload, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Carlos Oliveira",
    phone: "+55 11 98765-4321",
    email: "carlos@example.com",
    category: "Tech Corp - TI",
  },
  {
    id: "2",
    name: "Ana Costa",
    phone: "+55 11 97654-3210",
    email: "ana@example.com",
    category: "Tech Corp - Marketing",
  },
  {
    id: "3",
    name: "Pedro Santos",
    phone: "+55 11 96543-2109",
    email: "pedro@example.com",
    category: "Digital Inc",
  },
];

export const Contacts = () => {
  const [contacts] = useState<Contact[]>(mockContacts);
  const [searchTerm, setSearchTerm] = useState("");

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
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                </div>

                <Badge className="bg-primary/20 text-primary">
                  {contact.category}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};
