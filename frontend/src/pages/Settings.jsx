// src/pages/Settings.jsx
// Chú thích: Settings v3.0 - Modern grouped settings với toggles, cards
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import {
  Settings as SettingsIcon, Type, Globe, Sun, Moon,
  Bell, Shield, Info, Heart, Sparkles, RotateCcw,
  ChevronRight, ExternalLink
} from 'lucide-react';

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[--surface-border] last:border-0">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[--brand]/10 flex items-center justify-center shrink-0">
            <Icon size={20} className="text-[--brand]" />
          </div>
        )}
        <div>
          <h4 className="font-medium text-[--text]">{title}</h4>
          {description && <p className="text-sm text-[--muted] mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative w-12 h-7 rounded-full transition-colors
        ${checked ? 'bg-[--brand]' : 'bg-[--surface-border]'}
      `}
      role="switch"
      aria-checked={checked}
    >
      <motion.div
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function Settings() {
  const { settings, setFontScale, setLang, setNotifications, setSoundEffects } = useSettings();
  const { theme, toggle: toggleTheme } = useTheme();

  const resetAll = () => {
    if (confirm('Bạn có chắc muốn khôi phục tất cả cài đặt về mặc định?')) {
      setFontScale(1);
      setLang('vi');
      setNotifications?.(true);
      setSoundEffects?.(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-[--brand]" />
          <span className="gradient-text">Cài đặt</span>
        </h1>
        <p className="text-[--muted] text-sm mt-1">Tùy chỉnh trải nghiệm của bạn</p>
      </motion.div>

      {/* Appearance */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>🎨 Giao diện</Card.Title>
            <Card.Description>Tùy chỉnh cách hiển thị ứng dụng</Card.Description>
          </Card.Header>

          <Card.Content>
            <SettingRow
              icon={theme === 'dark' ? Moon : Sun}
              title="Chế độ tối"
              description="Dễ nhìn hơn trong môi trường thiếu sáng"
            >
              <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
            </SettingRow>

            <SettingRow
              icon={Type}
              title="Kích cỡ chữ"
              description="Điều chỉnh theo nhu cầu đọc của bạn"
            >
              <select
                value={String(settings.fontScale)}
                onChange={(e) => setFontScale(Number(e.target.value))}
                className="px-3 py-2 rounded-xl glass border-0 text-sm text-[--text] min-w-[120px]"
              >
                <option value="0.9">Rất nhỏ</option>
                <option value="0.95">Nhỏ</option>
                <option value="1">Bình thường</option>
                <option value="1.1">Lớn</option>
                <option value="1.2">Rất lớn</option>
              </select>
            </SettingRow>

            <SettingRow
              icon={Globe}
              title="Ngôn ngữ"
              description="Ngôn ngữ hiển thị trong ứng dụng"
            >
              <select
                value={settings.lang}
                onChange={(e) => setLang(e.target.value)}
                className="px-3 py-2 rounded-xl glass border-0 text-sm text-[--text] min-w-[120px]"
              >
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇬🇧 English (sắp có)</option>
              </select>
            </SettingRow>
          </Card.Content>
        </Card>
      </motion.section>

      {/* Notifications */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>🔔 Thông báo</Card.Title>
            <Card.Description>Quản lý thông báo và nhắc nhở</Card.Description>
          </Card.Header>

          <Card.Content>
            <SettingRow
              icon={Bell}
              title="Nhắc nhở hàng ngày"
              description="Nhắc bạn viết điều biết ơn mỗi ngày"
            >
              <Toggle
                checked={settings.notifications !== false}
                onChange={(v) => setNotifications?.(v)}
              />
            </SettingRow>

            <SettingRow
              icon={Sparkles}
              title="Hiệu ứng âm thanh"
              description="Âm thanh khi hoàn thành hoạt động"
            >
              <Toggle
                checked={settings.soundEffects !== false}
                onChange={(v) => setSoundEffects?.(v)}
              />
            </SettingRow>
          </Card.Content>
        </Card>
      </motion.section>

      {/* Privacy */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>🔒 Quyền riêng tư</Card.Title>
            <Card.Description>Dữ liệu của bạn được bảo vệ an toàn</Card.Description>
          </Card.Header>

          <Card.Content>
            <SettingRow
              icon={Shield}
              title="Lưu trữ cục bộ"
              description="Mọi dữ liệu được lưu trên thiết bị của bạn"
            >
              <Badge variant="success">Đã bật</Badge>
            </SettingRow>

            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full justify-between" iconRight={<ChevronRight size={16} />}>
                Chính sách bảo mật
              </Button>
              <Button variant="outline" className="w-full justify-between" iconRight={<ChevronRight size={16} />}>
                Điều khoản sử dụng
              </Button>
            </div>
          </Card.Content>
        </Card>
      </motion.section>

      {/* About */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>ℹ️ Về ứng dụng</Card.Title>
          </Card.Header>

          <Card.Content>
            <div className="flex items-center gap-4 py-4 border-b border-[--surface-border]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[--brand] to-[--brand-light] flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
              <div>
                <h3 className="font-bold text-lg gradient-text">Bạn Đồng Hành</h3>
                <p className="text-sm text-[--muted]">Phiên bản 3.0.0</p>
                <p className="text-xs text-[--muted] mt-1">Hỗ trợ Tâm lý Học đường</p>
              </div>
            </div>

            <div className="py-4 text-sm text-[--text-secondary] space-y-2">
              <p>
                Bạn Đồng Hành là ứng dụng hỗ trợ sức khỏe tâm thần dành riêng cho
                học sinh Việt Nam. Được phát triển với mục tiêu mang đến một không
                gian an toàn, thân thiện để các bạn chia sẻ và cải thiện sức khỏe tinh thần.
              </p>
              <p className="flex items-center gap-1">
                Được phát triển với <Heart size={14} className="text-red-500" fill="currentColor" /> tại Việt Nam
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />}>
                Website
              </Button>
              <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />}>
                Hỗ trợ
              </Button>
              <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />}>
                Góp ý
              </Button>
            </div>
          </Card.Content>
        </Card>
      </motion.section>

      {/* Reset */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="outlined" className="border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[--text]">Khôi phục mặc định</h4>
              <p className="text-sm text-[--muted]">Đặt lại tất cả cài đặt về ban đầu</p>
            </div>
            <Button variant="danger" size="sm" onClick={resetAll} icon={<RotateCcw size={16} />}>
              Khôi phục
            </Button>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}
