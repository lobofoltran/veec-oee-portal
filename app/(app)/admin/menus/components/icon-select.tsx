"use client";

import { type LucideIcon, FileText, LayoutDashboard, Home, Settings, Users, UserCog, Shield, Database, Table, Folder, FolderTree, ClipboardList, BarChart, LineChart, PieChart, TrendingUp, Activity, Bell, Calendar, Clock, Search, Filter, Layers, Grid3X3, Package, Truck, Map, MapPin, Building2, Factory, Wrench, Cpu, Server, KeyRound, Lock, Eye, EyeOff, Bookmark, Star, Flag, FileCog, ListTree, Boxes, Workflow, Gauge, CircleHelp } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type IconOption = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export const MENU_ICON_OPTIONS: IconOption[] = [
  { value: "LayoutDashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "Home", label: "Início", icon: Home },
  { value: "Settings", label: "Configurações", icon: Settings },
  { value: "Users", label: "Usuários", icon: Users },
  { value: "UserCog", label: "Gestão de Usuário", icon: UserCog },
  { value: "Shield", label: "Permissões", icon: Shield },
  { value: "Database", label: "Banco de Dados", icon: Database },
  { value: "Table", label: "Tabela", icon: Table },
  { value: "Folder", label: "Pasta", icon: Folder },
  { value: "FolderTree", label: "Árvore de Pastas", icon: FolderTree },
  { value: "FileText", label: "Documento", icon: FileText },
  { value: "ClipboardList", label: "Checklist", icon: ClipboardList },
  { value: "BarChart", label: "Gráfico de Barras", icon: BarChart },
  { value: "LineChart", label: "Gráfico de Linha", icon: LineChart },
  { value: "PieChart", label: "Gráfico de Pizza", icon: PieChart },
  { value: "TrendingUp", label: "Tendência", icon: TrendingUp },
  { value: "Activity", label: "Atividade", icon: Activity },
  { value: "Bell", label: "Notificações", icon: Bell },
  { value: "Calendar", label: "Calendário", icon: Calendar },
  { value: "Clock", label: "Relógio", icon: Clock },
  { value: "Search", label: "Busca", icon: Search },
  { value: "Filter", label: "Filtro", icon: Filter },
  { value: "Layers", label: "Camadas", icon: Layers },
  { value: "Grid3X3", label: "Grade", icon: Grid3X3 },
  { value: "Package", label: "Pacote", icon: Package },
  { value: "Truck", label: "Transporte", icon: Truck },
  { value: "Map", label: "Mapa", icon: Map },
  { value: "MapPin", label: "Localização", icon: MapPin },
  { value: "Building2", label: "Prédio", icon: Building2 },
  { value: "Factory", label: "Fábrica", icon: Factory },
  { value: "Wrench", label: "Ferramentas", icon: Wrench },
  { value: "Cpu", label: "CPU", icon: Cpu },
  { value: "Server", label: "Servidor", icon: Server },
  { value: "KeyRound", label: "Chave", icon: KeyRound },
  { value: "Lock", label: "Cadeado", icon: Lock },
  { value: "Eye", label: "Visualizar", icon: Eye },
  { value: "EyeOff", label: "Ocultar", icon: EyeOff },
  { value: "Bookmark", label: "Marcador", icon: Bookmark },
  { value: "Star", label: "Favorito", icon: Star },
  { value: "Flag", label: "Bandeira", icon: Flag },
  { value: "FileCog", label: "Arquivo Técnico", icon: FileCog },
  { value: "ListTree", label: "Lista Hierárquica", icon: ListTree },
  { value: "Boxes", label: "Inventário", icon: Boxes },
  { value: "Workflow", label: "Fluxo", icon: Workflow },
  { value: "Gauge", label: "Indicador", icon: Gauge },
];

export function getMenuIconOption(value: string | null | undefined) {
  return MENU_ICON_OPTIONS.find((option) => option.value === value);
}

export function IconPreview({ value }: { value?: string | null }) {
  const selected = getMenuIconOption(value);
  const Icon = selected?.icon ?? CircleHelp;

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
      <Icon className="size-4" aria-hidden="true" />
      <span className="font-medium">{selected?.label ?? "Sem ícone selecionado"}</span>
      <span className="text-muted-foreground">{selected?.value ?? "-"}</span>
    </div>
  );
}

export function IconSelect({ value, onValueChange, disabled }: { value?: string; onValueChange: (value: string) => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger aria-label="Selecionar ícone">
        <SelectValue placeholder="Selecionar ícone" />
      </SelectTrigger>
      <SelectContent>
        {MENU_ICON_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                <Icon className="size-4" aria-hidden="true" />
                <span>{option.label}</span>
                <span className="text-muted-foreground">({option.value})</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
