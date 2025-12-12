// src/pages/Settings.jsx
// Chú thích: Trang Cài đặt – đổi kích cỡ chữ và ngôn ngữ (persist localStorage)
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useSettings } from '../hooks/useSettings';

export default function Settings() {
  const { settings, setFontScale, setLang } = useSettings();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">⚙️ Cài đặt</h2>

      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-[--muted]">Kích cỡ chữ</label>
            <select
              value={String(settings.fontScale)}
              onChange={(e) => setFontScale(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg bg-[--surface] text-[--text]"
              aria-label="Kích cỡ chữ"
            >
              <option value="0.95">Nhỏ</option>
              <option value="1">Bình thường</option>
              <option value="1.1">Lớn</option>
            </select>
            <p className="text-xs text-[--muted]">Áp dụng toàn bộ ứng dụng qua biến CSS — không cần reload.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[--muted]">Ngôn ngữ</label>
            <select
              value={settings.lang}
              onChange={(e) => setLang(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-[--surface] text-[--text]"
              aria-label="Ngôn ngữ"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English (sắp có)</option>
            </select>
            <p className="text-xs text-[--muted]">Một số nội dung sẽ mặc định tiếng Việt. i18n nâng cao sẽ bổ sung sau.</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Mẹo</h3>
        <ul className="list-disc pl-5 text-[15px] space-y-1">
          <li>Dùng Dark/Light ở góc trên để đổi theme nhanh.</li>
          <li>Ở Chat, bạn có thể bật mic để nói trực tiếp và nghe trả lời bằng TTS.</li>
          <li>Vào Lọ Biết Ơn để theo dõi streak mỗi ngày.</li>
        </ul>
        <div className="mt-4">
          <Button variant="outline" onClick={() => alert('Sắp có: reset cài đặt về mặc định')}>Khôi phục mặc định</Button>
        </div>
      </Card>
    </div>
  );
}

