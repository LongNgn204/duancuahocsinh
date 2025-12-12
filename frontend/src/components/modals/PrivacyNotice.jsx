// src/components/modals/PrivacyNotice.jsx
// Chú thích: Modal thông báo quyền riêng tư lần đầu, lưu cờ consent vào localStorage
import Button from '../ui/Button';

export default function PrivacyNotice({ open, onAccept }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Thông báo quyền riêng tư">
      <div className="max-w-lg w-full rounded-2xl bg-[--surface] text-[--text] border border-[--surface-border] p-5 shadow-xl">
        <h3 className="text-lg font-semibold">Quyền riêng tư</h3>
        <div className="mt-2 space-y-2 text-[15px]">
          <p>Ứng dụng lưu một số dữ liệu trên thiết bị của bạn (localStorage) để cải thiện trải nghiệm: lịch sử chat, cài đặt, v.v.</p>
          <p>Chúng tôi không gửi dữ liệu cá nhân của bạn lên server nếu không có sự đồng ý. Khi bật AI, nội dung chat sẽ được gửi tới nhà cung cấp mô hình để xử lý.</p>
          <p>Bằng cách tiếp tục, bạn đồng ý với chính sách quyền riêng tư.</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <a className="px-3 py-1.5 rounded-lg bg-[--surface] text-[--text] border border-[--surface-border]" href="#" onClick={(e)=>e.preventDefault()}>Xem chi tiết</a>
          <Button onClick={onAccept} variant="primary" size="sm">Tôi hiểu</Button>
        </div>
      </div>
    </div>
  );
}

