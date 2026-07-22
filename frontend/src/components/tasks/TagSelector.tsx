"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useAvailableTags } from "@/lib/hooks/useTasks";
import { useOnClickOutside } from "@/lib/hooks/useOnClickOutside";

// デフォルトタグ（初期状態で選択肢として表示）
const DEFAULT_TAGS = ["課題", "試験", "プロジェクト", "読書", "仕事", "個人", "重要", "開発", "その他"];
const LS_CUSTOM = "sfc-tags-custom";
const LS_DELETED = "sfc-tags-deleted";

function loadLocal(key: string): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
function saveLocal(key: string, val: string[]) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(val));
}

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const { data: apiTags = [] } = useAvailableTags();
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState<string[]>(() => loadLocal(LS_CUSTOM));
  const [deleted, setDeleted] = useState<Set<string>>(() => new Set(loadLocal(LS_DELETED)));
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

  // 利用可能タグ = DEFAULT + API + custom - deleted
  const available = Array.from(
    new Set([...DEFAULT_TAGS, ...apiTags, ...custom])
  ).filter((t) => !deleted.has(t)).sort();

  const filtered = available.filter(
    (t) => t.toLowerCase().includes(input.toLowerCase()) && !selected.includes(t)
  );
  const canCreate = input.trim() && !available.includes(input.trim()) && !selected.includes(input.trim());

  // 外クリックで閉じる
  useOnClickOutside([triggerRef, dropdownRef], () => setOpen(false), open);

  function openDropdown() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropPos({ top: r.bottom + 4, left: r.left, width: r.width });
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function addTag(tag: string) {
    onChange([...selected, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(selected.filter((t) => t !== tag));
  }

  function createTag() {
    const t = input.trim();
    if (!t || selected.includes(t)) return;
    const updated = [...custom, t];
    setCustom(updated);
    saveLocal(LS_CUSTOM, updated);
    addTag(t);
  }

  function deleteFromList(tag: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = new Set(deleted);
    updated.add(tag);
    setDeleted(updated);
    saveLocal(LS_DELETED, Array.from(updated));
    // 選択中なら外す
    if (selected.includes(tag)) onChange(selected.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (filtered.length > 0) addTag(filtered[0]);
      else if (canCreate) createTag();
    } else if (e.key === "Backspace" && !input && selected.length > 0) {
      removeTag(selected[selected.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div>
      {/* 選択中タグ + 入力欄 */}
      <div
        ref={triggerRef}
        className="input-base flex flex-wrap gap-1.5 cursor-text min-h-[42px] items-center"
        onClick={openDropdown}
      >
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-sfc-blue/10 text-sfc-blue text-xs px-2 py-0.5 rounded-full font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="hover:text-red-500 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); if (!open) openDropdown(); }}
          onKeyDown={handleKeyDown}
          onFocus={openDropdown}
          placeholder={selected.length ? "" : "タグを検索または作成…"}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        />
      </div>

      {/* ドロップダウン */}
      {open && (
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: dropPos.top, left: dropPos.left, width: Math.max(dropPos.width, 220), zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 max-h-52 overflow-y-auto"
        >
          {filtered.map((tag) => (
            <div
              key={tag}
              className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 cursor-pointer group"
              onClick={() => addTag(tag)}
            >
              <span className="text-sm text-gray-700">#{tag}</span>
              <button
                type="button"
                onClick={(e) => deleteFromList(tag, e)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs leading-none p-1"
                title="リストから削除"
              >
                ×
              </button>
            </div>
          ))}

          {canCreate && (
            <div
              className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer flex items-center gap-2 border-t border-gray-100"
              onClick={createTag}
            >
              <svg className="w-3.5 h-3.5 text-sfc-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm text-sfc-blue">「{input.trim()}」を作成</span>
            </div>
          )}

          {filtered.length === 0 && !canCreate && (
            <p className="px-3 py-2 text-xs text-gray-400">該当するタグなし</p>
          )}
        </div>
      )}
    </div>
  );
}
