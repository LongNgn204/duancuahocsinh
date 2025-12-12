// src/components/modals/OnboardingModal.jsx
// Chú thích: Modal onboarding ngắn (first-run tour)
import Button from '../ui/Button';

export default function OnboardingModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Bắt đầu sử dụng">
      <div className="max-w-lg w-full rounded-2xl bg-[--surface] text-[--text] border border-[--surface-border] p-5 shadow-xl space-y-3">
        <h3 className="text-lg font-semibold">Chào mừng bạn 👋</h3>
        <p className="text-[15px]">Đây là “Bạn Đồng Hành” – nơi bạn có thể tâm sự an toàn, luyện thở, và nuôi dưỡng lòng biết ơn.</p>
        <ul className="list-disc pl-5 text-[15px] space-y-1">
          <li>Chat: trò chuyện với AI (có mic và đọc to), gửi hình ảnh khi cần.</li>
          <li>Thở: chọn pattern (4‑7‑8, box…), có âm thanh nhịp.</li>
          <li>Biết ơn: viết nhanh điều tích cực, theo dõi streak.</li>
        </ul>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="primary" size="sm" onClick={onClose}>Bắt đầu</Button>
        </div>
      </div>
    </div>
  );
}

