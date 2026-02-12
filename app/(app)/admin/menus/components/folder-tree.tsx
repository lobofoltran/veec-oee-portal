"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type FolderNode = {
  id: string;
  label: string;
  parentId: string | null;
};

type TreeNode = FolderNode & { children: TreeNode[] };

function buildTree(folders: FolderNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  folders.forEach((folder) => map.set(folder.id, { ...folder, children: [] }));

  folders.forEach((folder) => {
    const node = map.get(folder.id);
    if (!node) return;

    if (!folder.parentId) {
      roots.push(node);
      return;
    }

    const parent = map.get(folder.parentId);
    if (!parent) {
      roots.push(node);
      return;
    }

    parent.children.push(node);
  });

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.label.localeCompare(b.label));
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);
  return roots;
}

function TreeItem({
  node,
  level,
  selectedId,
  onSelect,
}: {
  node: TreeNode;
  level: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined} aria-selected={isSelected}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
          isSelected && "bg-primary/10 text-primary font-medium"
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={() => onSelect?.(node.id)}
      >
        {hasChildren ? (
          <span
            className="inline-flex size-4 items-center justify-center"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((current) => !current);
            }}
            aria-label={expanded ? "Recolher pasta" : "Expandir pasta"}
          >
            {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </span>
        ) : (
          <span className="size-4" />
        )}

        {expanded && hasChildren ? <FolderOpen className="size-4 text-primary" /> : <Folder className="size-4 text-primary" />}
        <span>{node.label}</span>
      </button>

      {hasChildren && expanded ? (
        <ul role="group" className="space-y-0.5">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function FolderTree({
  folders,
  selectedId,
  onSelect,
  className,
}: {
  folders: FolderNode[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const tree = useMemo(() => buildTree(folders), [folders]);

  return (
    <div className={cn("max-h-72 overflow-y-auto rounded-md border p-2", className)}>
      <ul role="tree" className="space-y-0.5" aria-label="Árvore de pastas">
        {tree.map((node) => (
          <TreeItem key={node.id} node={node} level={0} selectedId={selectedId} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  );
}
