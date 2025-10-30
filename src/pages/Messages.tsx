import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Image as ImageIcon, X, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const mockCategories = [
  { id: "1", name: "São Paulo - Tech Corp - TI" },
  { id: "2", name: "São Paulo - Tech Corp - Marketing" },
  { id: "3", name: "São Paulo - Digital Inc" },
];

export const Messages = () => {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [minDelay, setMinDelay] = useState("20");
  const [maxDelay, setMaxDelay] = useState("60");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSendMessages = () => {
    toast({
      title: "Mensagens enviadas!",
      description: `${selectedCategories.length} categoria(s) selecionada(s). Enviando para ${selectedCategories.length * 10} contatos.`,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && images.length < 5) {
      const newImages = Array.from(files).slice(0, 5 - images.length);
      const imageUrls = newImages.map((file) => URL.createObjectURL(file));
      setImages([...images, ...imageUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Disparo de Mensagens</h1>
          <p className="text-muted-foreground mt-1">
            Configure e envie mensagens para seus contatos
          </p>
        </div>

        <div className="space-y-6">
          <Card className="glass-card p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="message" className="text-base">
                  Mensagem Base
                </Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 min-h-[150px] bg-secondary/50 border-white/10"
                />
              </div>

              <div>
                <Label className="text-base mb-2 block">
                  Imagens (até 5)
                </Label>
                <div className="space-y-4">
                  {images.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {images.length < 5 && (
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white/10 rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Adicionar imagem ({images.length}/5)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="space-y-4">
              <Label className="text-base">Delay entre mensagens (segundos)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minDelay" className="text-sm text-muted-foreground">
                    Mínimo
                  </Label>
                  <Input
                    id="minDelay"
                    type="number"
                    min="20"
                    value={minDelay}
                    onChange={(e) => {
                      const val = Math.max(20, parseInt(e.target.value) || 20);
                      setMinDelay(val.toString());
                    }}
                    className="mt-1 bg-secondary/50 border-white/10"
                  />
                </div>
                <div>
                  <Label htmlFor="maxDelay" className="text-sm text-muted-foreground">
                    Máximo
                  </Label>
                  <Input
                    id="maxDelay"
                    type="number"
                    min={minDelay}
                    value={maxDelay}
                    onChange={(e) => setMaxDelay(e.target.value)}
                    className="mt-1 bg-secondary/50 border-white/10"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="space-y-4">
              <Label className="text-base">Selecionar Categorias</Label>
              
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-secondary/50 border-white/10 hover:bg-secondary/70"
                  >
                    <span className="text-muted-foreground">
                      {selectedCategories.length === 0
                        ? "Selecione as categorias..."
                        : `${selectedCategories.length} categoria(s) selecionada(s)`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover border-white/10" align="start">
                  <Command className="bg-popover">
                    <CommandInput 
                      placeholder="Buscar categoria..." 
                      className="border-none focus:ring-0"
                    />
                    <CommandList>
                      <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                      <CommandGroup>
                        {mockCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() => handleCategoryToggle(category.id)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategories.includes(category.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Categorias Selecionadas */}
              {selectedCategories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Categorias selecionadas:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((categoryId) => {
                      const category = mockCategories.find((c) => c.id === categoryId);
                      return (
                        <Badge
                          key={categoryId}
                          variant="secondary"
                          className="px-3 py-1.5 gap-2"
                        >
                          {category?.name}
                          <button
                            onClick={() => handleCategoryToggle(categoryId)}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleSendMessages}
          >
            <Send className="w-5 h-5 mr-2" />
            Enviar Mensagens
          </Button>
        </div>
      </div>
    </Layout>
  );
};
