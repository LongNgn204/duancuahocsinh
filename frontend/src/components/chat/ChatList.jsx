// src/components/chat/ChatList.jsx
// Chú thích: Danh sách hội thoại (threads) bên trái cho Chat 2-pane
import { motion } from 'framer-motion';
import { MessageCircle, Trash2, Edit2, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

function formatRel(ts) {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  } catch (_) { return ''; }
}

export default function ChatList({ threads, currentId, onNew, onSelect, onRename, onDelete, minimal = false }) {
  if (minimal) {
    return (
      <div className="space-y-1" role="navigation" aria-label="Danh sách hội thoại">
        {threads.length === 0 && (
          <div className="text-center py-8 text-sm text-[--muted]">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p>Chưa có hội thoại</p>
            <p className="text-xs mt-1">Tạo chat mới để bắt đầu</p>
          </div>
        )}
        {threads.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all relative group ${
              t.id === currentId
                ? 'bg-gradient-to-r from-[--brand]/20 to-[--brand]/10 text-[--brand] border border-[--brand]/30 shadow-sm'
                : 'hover:bg-[--surface-border] text-[--text]'
            }`}
            aria-current={t.id === currentId ? 'page' : undefined}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium mb-0.5">{t.title || 'Cuộc trò chuyện mới'}</div>
                <div className="text-xs text-[--muted]">{formatRel(t.updatedAt)}</div>
              </div>
              {t.id === currentId && (
                <ChevronRight size={16} className="text-[--brand] shrink-0" />
              )}
            </div>
            
            {/* Action buttons on hover */}
            {t.id === currentId && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    const name = window.prompt('Đặt tên hội thoại:', t.title || '');
                    if (name !== null && name.trim()) onRename(t.id, name.trim());
                  }}
                  className="p-1.5 rounded-lg hover:bg-[--brand]/20 text-[--muted] hover:text-[--brand] transition-colors cursor-pointer"
                  title="Đổi tên"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      const name = window.prompt('Đặt tên hội thoại:', t.title || '');
                      if (name !== null && name.trim()) onRename(t.id, name.trim());
                    }
                  }}
                >
                  <Edit2 size={14} />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Bạn có chắc muốn xóa hội thoại này?')) {
                      onDelete(t.id);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-[--muted] hover:text-red-500 transition-colors cursor-pointer"
                  title="Xóa"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      if (confirm('Bạn có chắc muốn xóa hội thoại này?')) {
                        onDelete(t.id);
                      }
                    }
                  }}
                >
                  <Trash2 size={14} />
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    );
  }

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
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${t.id === currentId ? 'bg-[--brand]/10 text-[--brand]' : 'hover:bg-[--surface]/80 text-[--text]'}`}
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

