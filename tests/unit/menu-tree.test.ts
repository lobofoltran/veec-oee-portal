import { describe, expect, it } from "vitest";

import { buildMenuTree } from "@/lib/menu/loader";

describe("menu tree", () => {
  it("orders items and prevents cycles", () => {
    const now = new Date();
    const items = [
      { id: "1", label: "Root", icon: "file", href: null, parentId: null, order: 2, enabled: true, createdAt: now, updatedAt: now },
      { id: "2", label: "Child", icon: "file", href: "/x", parentId: "1", order: 1, enabled: true, createdAt: now, updatedAt: now },
      { id: "3", label: "Root A", icon: "file", href: "/a", parentId: null, order: 1, enabled: true, createdAt: now, updatedAt: now },
    ];

    const tree = buildMenuTree(items);
    expect(tree[0]?.id).toBe("3");
    expect(tree[1]?.children[0]?.id).toBe("2");
  });
});
