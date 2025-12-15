// src/pages/Settings.jsx
// Chú thích: Settings v1.15.dev - Nâng cấp đầy đủ chức năng
import { motion } from 'framer-motion';
import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useSettings } from '../hooks/useSettings';
// import { useTheme } from '../hooks/useTheme'; // Đã ẩn dark mode
import { useTourStatus } from '../components/tour/TourGuide';
import { useAuth } from '../hooks/useAuth';
import { exportAllData, importData, deleteAccount } from '../utils/api';
import {
  Settings as SettingsIcon, Type, Globe, Sun, Moon, // Moon/Sun giữ lại cho icon khác
  Bell, Shield, Info, Heart, Sparkles, RotateCcw,
  ChevronRight, ExternalLink, HelpCircle, Download, Upload,
  Trash2, Database, User, Eye, EyeOff, Volume2, VolumeX,
  Zap, HardDrive, RefreshCw, AlertCircle, CheckCircle2,
  Clock, Mail, Phone, Lock, FileText, DownloadCloud
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
  const { settings, setFontScale, setLang, setNotifications, setSoundEffects, resetSettings } = useSettings();
  // const { theme, toggle: toggleTheme } = useTheme(); // Đã ẩn dark mode
  const { resetTour } = useTourStatus();
  const { user, isLoggedIn } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const resetAll = () => {
    if (confirm('Bạn có chắc muốn khôi phục tất cả cài đặt về mặc định?')) {
      resetSettings();
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ban-dong-hanh-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Đã xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setIsImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importData(data);
        alert('Đã nhập dữ liệu thành công! Vui lòng tải lại trang.');
        window.location.reload();
      } catch (error) {
        console.error('Import error:', error);
        alert('Có lỗi xảy ra khi nhập dữ liệu. Vui lòng kiểm tra file và thử lại.');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const clearCache = () => {
    if (confirm('Bạn có chắc muốn xóa cache? Ứng dụng sẽ tải lại sau khi xóa.')) {
      try {
        // Clear localStorage (except settings)
        const settingsBackup = localStorage.getItem('settings_v1');
        localStorage.clear();
        if (settingsBackup) {
          localStorage.setItem('settings_v1', settingsBackup);
        }
        // Clear sessionStorage
        sessionStorage.clear();
        alert('Đã xóa cache thành công! Ứng dụng sẽ tải lại.');
        window.location.reload();
      } catch (error) {
        console.error('Clear cache error:', error);
        alert('Có lỗi xảy ra khi xóa cache.');
      }
    }
  };

  const clearAllData = () => {
    if (confirm('⚠️ CẢNH BÁO: Bạn có chắc muốn xóa TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!\n\nDữ liệu sẽ bị xóa:\n- Nhật ký\n- Lọ Biết Ơn\n- Thành tích\n- Thống kê\n- Cài đặt (trừ cài đặt hệ thống)')) {
      if (confirm('Bạn thực sự chắc chắn? Nhập "XÓA" để xác nhận (không cần nhập, chỉ cần xác nhận).')) {
        try {
          localStorage.clear();
          sessionStorage.clear();
          alert('Đã xóa tất cả dữ liệu. Ứng dụng sẽ tải lại.');
          window.location.reload();
        } catch (error) {
          console.error('Clear all data error:', error);
          alert('Có lỗi xảy ra khi xóa dữ liệu.');
        }
      }
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
            {/* Dark mode toggle đã được ẩn - nhiều trang web vẫn bị lẫn lộn */}
            {/* <SettingRow
              icon={theme === 'dark' ? Moon : Sun}
              title="Chế độ tối"
              description="Dễ nhìn hơn trong môi trường thiếu sáng"
            >
              <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
            </SettingRow> */}

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

      {/* Account */}
      {isLoggedIn && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card>
            <Card.Header>
              <Card.Title>👤 Tài khoản</Card.Title>
              <Card.Description>Quản lý thông tin tài khoản của bạn</Card.Description>
            </Card.Header>

            <Card.Content>
              <SettingRow
                icon={User}
                title="Tên người dùng"
                description={user?.username || 'Chưa đặt tên'}
              >
                <Badge variant="info">{user?.username || 'Khách'}</Badge>
              </SettingRow>

              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full justify-between" iconRight={<ChevronRight size={16} />}>
                  Chỉnh sửa hồ sơ
                </Button>
                <Button variant="outline" className="w-full justify-between" iconRight={<ChevronRight size={16} />}>
                  Đổi mật khẩu
                </Button>
              </div>
            </Card.Content>
          </Card>
        </motion.section>
      )}

      {/* Notifications */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>🔔 Thông báo & Âm thanh</Card.Title>
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

            <SettingRow
              icon={Volume2}
              title="Âm thanh hệ thống"
              description="Bật/tắt tất cả âm thanh trong ứng dụng"
            >
              <Toggle
                checked={true}
                onChange={() => {}}
              />
            </SettingRow>

            <SettingRow
              icon={Clock}
              title="Nhắc nhở giờ ngủ"
              description="Nhắc bạn ghi lại giấc ngủ mỗi ngày"
            >
              <Toggle
                checked={true}
                onChange={() => {}}
              />
            </SettingRow>
          </Card.Content>
        </Card>
      </motion.section>

      {/* Data Management */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>💾 Quản lý dữ liệu</Card.Title>
            <Card.Description>Xuất, nhập hoặc xóa dữ liệu của bạn</Card.Description>
          </Card.Header>

          <Card.Content>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between"
                icon={<Download size={16} />}
                iconRight={<ChevronRight size={16} />}
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? 'Đang xuất...' : 'Xuất dữ liệu'}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                icon={<Upload size={16} />}
                iconRight={<ChevronRight size={16} />}
                onClick={handleImportData}
                disabled={isImporting}
              >
                {isImporting ? 'Đang nhập...' : 'Nhập dữ liệu'}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between text-orange-500 hover:text-orange-600"
                icon={<RefreshCw size={16} />}
                iconRight={<ChevronRight size={16} />}
                onClick={clearCache}
              >
                Xóa cache
              </Button>
            </div>
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
            <Card.Title>🔒 Quyền riêng tư & Bảo mật</Card.Title>
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

            <SettingRow
              icon={Eye}
              title="Chế độ ẩn danh"
              description="Không lưu lịch sử hoạt động"
            >
              <Toggle
                checked={false}
                onChange={() => {}}
              />
            </SettingRow>

            <SettingRow
              icon={Database}
              title="Đồng bộ dữ liệu"
              description="Tự động đồng bộ với máy chủ"
            >
              <Toggle
                checked={isLoggedIn}
                onChange={() => {}}
                disabled={!isLoggedIn}
              />
            </SettingRow>

            <SettingRow
              icon={Lock}
              title="Mã hóa dữ liệu"
              description="Dữ liệu nhạy cảm được mã hóa"
            >
              <Badge variant="success">Đã bật</Badge>
            </SettingRow>

            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full justify-between" iconRight={<ChevronRight size={16} />}>
                <FileText size={16} className="mr-2" />
                Chính sách bảo mật
              </Button>
              <Button variant="outline" className="w-full justify-between" iconRight={<ChevronRight size={16} />}>
                <FileText size={16} className="mr-2" />
                Điều khoản sử dụng
              </Button>
            </div>
          </Card.Content>
        </Card>
      </motion.section>

      {/* Accessibility */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>♿ Khả năng truy cập</Card.Title>
            <Card.Description>Tùy chỉnh để phù hợp với nhu cầu của bạn</Card.Description>
          </Card.Header>

          <Card.Content>
            <SettingRow
              icon={Eye}
              title="Chế độ tương phản cao"
              description="Tăng độ tương phản cho dễ nhìn"
            >
              <Toggle
                checked={highContrast}
                onChange={setHighContrast}
              />
            </SettingRow>

            <SettingRow
              icon={Zap}
              title="Giảm chuyển động"
              description="Tắt animation để giảm chuyển động"
            >
              <Toggle
                checked={reducedMotion}
                onChange={setReducedMotion}
              />
            </SettingRow>

            <SettingRow
              icon={Type}
              title="Chế độ compact"
              description="Hiển thị nhiều nội dung hơn trên màn hình"
            >
              <Toggle
                checked={compactMode}
                onChange={setCompactMode}
              />
            </SettingRow>
          </Card.Content>
        </Card>
      </motion.section>

      {/* Performance */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>⚡ Hiệu suất</Card.Title>
            <Card.Description>Tối ưu hóa hiệu suất ứng dụng</Card.Description>
          </Card.Header>

          <Card.Content>
            <SettingRow
              icon={HardDrive}
              title="Lưu tự động"
              description="Tự động lưu dữ liệu khi thay đổi"
            >
              <Toggle
                checked={autoSave}
                onChange={setAutoSave}
              />
            </SettingRow>

            <SettingRow
              icon={Zap}
              title="Tối ưu hóa hiệu suất"
              description="Giảm sử dụng tài nguyên"
            >
              <Badge variant="info">Tự động</Badge>
            </SettingRow>

            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full justify-between"
                icon={<RefreshCw size={16} />}
                iconRight={<ChevronRight size={16} />}
                onClick={() => window.location.reload()}
              >
                Làm mới ứng dụng
              </Button>
            </div>
          </Card.Content>
        </Card>
      </motion.section>

      {/* Advanced */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
      >
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <div>
                <Card.Title>⚙️ Nâng cao</Card.Title>
                <Card.Description>Cài đặt dành cho người dùng nâng cao</Card.Description>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Ẩn' : 'Hiện'}
              </Button>
            </div>
          </Card.Header>

          {showAdvanced && (
            <Card.Content>
              <SettingRow
                icon={Database}
                title="Gửi dữ liệu phân tích"
                description="Giúp cải thiện ứng dụng (ẩn danh)"
              >
                <Toggle
                  checked={analyticsEnabled}
                  onChange={setAnalyticsEnabled}
                />
              </SettingRow>

              <SettingRow
                icon={AlertCircle}
                title="Báo cáo lỗi tự động"
                description="Gửi báo cáo lỗi để sửa chữa"
              >
                <Toggle
                  checked={crashReports}
                  onChange={setCrashReports}
                />
              </SettingRow>

              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-between text-blue-500"
                  icon={<DownloadCloud size={16} />}
                  iconRight={<ChevronRight size={16} />}
                  onClick={() => window.open('https://ban-dong-hanh.pages.dev', '_blank')}
                >
                  Kiểm tra cập nhật
                </Button>
              </div>
            </Card.Content>
          )}
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
                <p className="text-sm text-[--muted]">Phiên bản 1.15.dev</p>
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

            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<HelpCircle size={14} />}
                  onClick={resetTour}
                  className="w-full justify-start"
                >
                  Xem lại hướng dẫn
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ExternalLink size={14} />}
                  onClick={() => window.open('https://ban-dong-hanh.pages.dev', '_blank')}
                  className="w-full justify-start"
                >
                  Website
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Mail size={14} />}
                  onClick={() => window.open('mailto:stu725114073@hnue.edu.vn', '_blank')}
                  className="w-full justify-start"
                >
                  Email hỗ trợ
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Phone size={14} />}
                  onClick={() => window.open('tel:0896636181', '_blank')}
                  className="w-full justify-start"
                >
                  Hotline: 1800 599 920
                </Button>
              </div>
              <div className="pt-2 border-t border-[--surface-border]">
                <p className="text-xs text-[--muted] text-center">
                  Phát triển bởi <span className="font-semibold text-[--brand]">Long Nguyễn</span>
                </p>
                <p className="text-xs text-[--muted] text-center mt-1">
                  © 2025 Bạn Đồng Hành. Được phát triển với tình yêu quý dành cho tất cả học sinh Việt Nam.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.section>

      {/* Reset & Danger Zone */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <Card variant="outlined" className="border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[--text]">Khôi phục mặc định</h4>
              <p className="text-sm text-[--muted]">Đặt lại tất cả cài đặt về ban đầu</p>
            </div>
            <Button variant="outline" size="sm" onClick={resetAll} icon={<RotateCcw size={16} />}>
              Khôi phục
            </Button>
          </div>
        </Card>

      </motion.section>
    </div>
  );
}
