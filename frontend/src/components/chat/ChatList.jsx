// src/components/chat/ChatList.jsx
// Chú thích: Danh sách hội thoại (threads) bên trái cho Chat 2-pane
import Button from '../ui/Button';

function formatRel(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  } catch (_) { return ''; }
}

export default function ChatList({ threads, currentId, onNew, onSelect, onRename, onDelete }) {
  return (
    <aside className="w-full md:w-72 border border-[--surface-border] bg-[--surface] rounded-xl p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-[--text]">Hội thoại</div>
        <Button variant="primary" size="sm" onClick={onNew}>+ Chat mới</Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1" role="navigation" aria-label="Danh sách hội thoại">
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${t.id === currentId ? 'bg-brand/10 text-brand' : 'hover:bg-[--surface]/80 text-[--text]'}`}
            aria-current={t.id === currentId ? 'page' : undefined}
          >
            <div className="truncate text-sm font-medium">{t.title}</div>
            <div className="text-xs text-[--muted]">{formatRel(t.updatedAt)}</div>
          </button>
        ))}
        {!threads.length && (
          <div className="text-sm text-[--muted]">Chưa có hội thoại</div>
        )}
      </div>
      {currentId && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const name = window.prompt('Đặt tên hội thoại');
            if (name && name.trim()) onRename(currentId, name.trim());
          }}>Đổi tên</Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(currentId)}>Xoá</Button>
        </div>
      )}
    </aside>
  );
}

