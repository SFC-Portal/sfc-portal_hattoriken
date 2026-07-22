"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useCreateSubtask } from "@/lib/hooks/useTasks";
import { DateRangePicker } from "./DateRangePicker";

export function SubTaskAddForm({ parentId, onDone }: { parentId: string; onDone: () => void }) {
  const createSubtask = useCreateSubtask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<string | undefined>();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function submit() {
    const t = title.trim();
    if (!t) return;
    createSubtask.mutate(
      { parentId, input: { title: t, description: description || undefined, startDate, dueDate } },
      { onSuccess: onDone },
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="text-sm font-medium text-gray-600">サブタスクを追加</p>
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") { e.preventDefault(); submit(); }
          if (e.key === "Escape") onDone();
        }}
        placeholder="タスク名 *"
        disabled={createSubtask.isPending}
        className="input-base w-full"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="説明（任意）"
        rows={2}
        disabled={createSubtask.isPending}
        className="input-base w-full resize-none text-sm"
      />
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">期間</label>
        <DateRangePicker
          startDate={startDate}
          endDate={dueDate}
          onChange={(s, e) => { setStartDate(s); setDueDate(e); }}
        />
      </div>
      <p className="text-sm text-gray-500">優先度・タグ・カテゴリは親タスクから自動引き継ぎ</p>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onDone}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5">キャンセル</button>
        <button type="button" onClick={submit}
          disabled={!title.trim() || createSubtask.isPending}
          className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {createSubtask.isPending ? "追加中…" : "追加"}
        </button>
      </div>
    </div>
  );
}
