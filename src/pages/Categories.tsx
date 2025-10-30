import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  type: "cidade" | "empresa" | "setor";
  parentId?: string;
  children?: Category[];
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "São Paulo",
    type: "cidade",
    children: [
      {
        id: "2",
        name: "Tech Corp",
        type: "empresa",
        parentId: "1",
        children: [
          { id: "3", name: "TI", type: "setor", parentId: "2" },
          { id: "4", name: "Marketing", type: "setor", parentId: "2" },
        ],
      },
      {
        id: "5",
        name: "Digital Inc",
        type: "empresa",
        parentId: "1",
      },
    ],
  },
];

const CategoryTree = ({ category }: { category: Category }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  const typeColors = {
    cidade: "bg-primary/20 text-primary",
    empresa: "bg-accent/20 text-accent",
    setor: "bg-secondary text-secondary-foreground",
  };

  return (
    <div className="space-y-2">
      <Card className="glass-card p-3 md:p-4 hover-lift">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4 md:w-5 flex-shrink-0" />}
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                <h3 className="font-semibold text-sm md:text-base truncate">{category.name}</h3>
                <Badge className={`${typeColors[category.type]} text-xs w-fit`}>
                  {category.type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="action"
              size="icon"
              className="h-8 w-8"
            >
              <Edit className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button
              variant="action-destructive"
              size="icon"
              className="h-8 w-8"
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {hasChildren && isExpanded && (
        <div className="ml-4 md:ml-8 space-y-2 border-l-2 border-white/10 pl-2 md:pl-4">
          {category.children?.map((child) => (
            <CategoryTree key={child.id} category={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Categories = () => {
  const [categories] = useState<Category[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
            <p className="text-muted-foreground mt-1">
              Organize seus contatos em cidades, empresas e setores
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        <Card className="glass-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-white/10"
            />
          </div>
        </Card>

        <div className="space-y-4">
          {categories.map((category) => (
            <CategoryTree key={category.id} category={category} />
          ))}
        </div>
      </div>
    </Layout>
  );
};
