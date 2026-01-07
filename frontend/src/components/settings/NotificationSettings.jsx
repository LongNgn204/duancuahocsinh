// src/components/settings/NotificationSettings.jsx
// Chú thích: Component cài đặt thông báo - Push notifications cho reminders
// Phase 2: Browser Notifications

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, BellOff, Moon, Timer, AlertCircle, Check, Info, Wind, Heart } from 'lucide-react';
import { isLoggedIn, getNotificationSettings, saveNotificationSettings } from '../../utils/api';
import {
    requestNotificationPermission,
    sendNotification,
    scheduleGratitudeReminder,
    scheduleSleepReminder,
    scheduleBreathingReminder,
    initializeNotificationsFromSettings,
    getNotificationPermission,
} from '../../utils/notificationService';

// =============================================================================
// NOTIFICATION SETTINGS COMPONENT
// =============================================================================
export default function NotificationSettings() {
    const [settings, setSettings] = useState({
        daily_reminder: false,
        pomodoro_alerts: true,
        sleep_reminder: false,
        reminder_time: '09:00',
    });
    const [permissionStatus, setPermissionStatus] = useState('default');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const scheduledTimeoutsRef = useRef([]); // Lưu timeout IDs để clear sau

    // Check notification permission
    useEffect(() => {
        setPermissionStatus(getNotificationPermission());
    }, []);

    // Initialize scheduled notifications khi settings thay đổi
    useEffect(() => {
        if (permissionStatus === 'granted' && !loading) {
            // Clear existing
            scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
            scheduledTimeoutsRef.current = [];

            // Schedule mới
            if (settings.daily_reminder && settings.reminder_time) {
                const id = scheduleGratitudeReminder(settings.reminder_time);
                scheduledTimeoutsRef.current.push(id);
            }

            if (settings.sleep_reminder) {
                const id = scheduleSleepReminder(settings.sleep_reminder_time || '22:00');
                scheduledTimeoutsRef.current.push(id);
            }
        }

        return () => {
            // Cleanup khi unmount
            scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
        };
    }, [settings.daily_reminder, settings.reminder_time, settings.sleep_reminder, permissionStatus, loading]);

    // Load settings từ server
    useEffect(() => {
        const loadSettings = async () => {
            if (!isLoggedIn()) {
                // Load từ localStorage cho guest
                const saved = localStorage.getItem('notification_settings');
                if (saved) {
                    try {
                        setSettings(JSON.parse(saved));
                    } catch { }
                }
                setLoading(false);
                return;
            }

            try {
                const data = await getNotificationSettings();
                if (data.settings) {
                    setSettings({
                        daily_reminder: !!data.settings.daily_reminder,
                        pomodoro_alerts: data.settings.pomodoro_alerts !== false,
                        sleep_reminder: !!data.settings.sleep_reminder,
                        reminder_time: data.settings.reminder_time || '09:00',
                        sleep_reminder_time: data.settings.sleep_reminder_time || '22:00',
                        breathing_reminder: !!data.settings.breathing_reminder,
                    });
                }
            } catch (e) {
                console.warn('[Notifications] Failed to load:', e);
            }
            setLoading(false);
        };
        loadSettings();
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        try {
            const granted = await requestNotificationPermission();
            setPermissionStatus(getNotificationPermission());

            if (granted) {
                setMessage({ type: 'success', text: 'Đã bật thông báo! Các nhắc nhở sẽ được gửi theo lịch đã cài đặt.' });
                // Gửi test notification
                setTimeout(() => {
                    sendNotification('🌟 Bạn Đồng Hành', {
                        body: 'Thông báo đã được bật thành công!',
                    });
                }, 500);
                return true;
            } else {
                setMessage({ type: 'error', text: 'Bạn đã từ chối nhận thông báo' });
                return false;
            }
        } catch (e) {
            setMessage({ type: 'error', text: e.message || 'Lỗi khi yêu cầu quyền thông báo' });
            return false;
        }
    }, []);

    // Toggle setting
    const toggleSetting = useCallback(async (key) => {
        // Nếu bật thông báo mà chưa có quyền, request trước
        if (!settings[key] && permissionStatus !== 'granted') {
            const granted = await requestPermission();
            if (!granted) return;
        }

        const newValue = !settings[key];
        const newSettings = { ...settings, [key]: newValue };
        setSettings(newSettings);

        // Auto-save
        setSaving(true);
        try {
            if (isLoggedIn()) {
                await saveNotificationSettings({ [key]: newValue });
            } else {
                localStorage.setItem('notification_settings', JSON.stringify(newSettings));
            }
        } catch (e) {
            console.warn('[Notifications] Failed to save:', e);
        }
        setSaving(false);
    }, [settings, permissionStatus, requestPermission]);

    // Update reminder time
    const updateReminderTime = useCallback(async (time) => {
        const newSettings = { ...settings, reminder_time: time };
        setSettings(newSettings);

        try {
            if (isLoggedIn()) {
                await saveNotificationSettings({ reminder_time: time });
            } else {
                localStorage.setItem('notification_settings', JSON.stringify(newSettings));
            }
        } catch (e) {
            console.warn('[Notifications] Failed to save time:', e);
        }
    }, [settings]);

    // Test notification
    const sendTestNotification = useCallback(() => {
        if (permissionStatus !== 'granted') {
            requestPermission();
            return;
        }

        sendNotification('🌟 Bạn Đồng Hành', {
            body: 'Đây là thông báo test. Chúc bạn một ngày tốt lành!',
        });
    }, [permissionStatus, requestPermission]);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    Cài đặt thông báo
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Nhận nhắc nhở để duy trì thói quen tốt
                </p>
            </div>

            {/* Permission Warning */}
            {permissionStatus !== 'granted' && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-amber-800">
                            Bạn cần cho phép thông báo để nhận nhắc nhở
                        </p>
                        <button
                            onClick={requestPermission}
                            className="text-sm text-amber-600 font-medium hover:underline mt-1"
                        >
                            Bật thông báo ngay →
                        </button>
                    </div>
                </div>
            )}

            {/* Message */}
            {message && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}

            {/* Settings List */}
            <div className="space-y-4">
                {/* Daily Reminder */}
                <SettingItem
                    icon={<Bell className="w-5 h-5" />}
                    title="Nhắc nhở hàng ngày"
                    description="Nhắc viết nhật ký biết ơn"
                    enabled={settings.daily_reminder}
                    onToggle={() => toggleSetting('daily_reminder')}
                >
                    {settings.daily_reminder && (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-500">Thời gian:</span>
                            <input
                                type="time"
                                value={settings.reminder_time}
                                onChange={(e) => updateReminderTime(e.target.value)}
                                className="px-2 py-1 text-sm rounded-lg border border-gray-200 bg-white"
                            />
                        </div>
                    )}
                </SettingItem>

                {/* Pomodoro Alerts */}
                <SettingItem
                    icon={<Timer className="w-5 h-5" />}
                    title="Thông báo Pomodoro"
                    description="Báo khi hết thời gian tập trung/nghỉ"
                    enabled={settings.pomodoro_alerts}
                    onToggle={() => toggleSetting('pomodoro_alerts')}
                />

                {/* Sleep Reminder */}
                <SettingItem
                    icon={<Moon className="w-5 h-5" />}
                    title="Nhắc giờ ngủ"
                    description="Nhắc đi ngủ lúc 22:00"
                    enabled={settings.sleep_reminder}
                    onToggle={() => toggleSetting('sleep_reminder')}
                >
                    {settings.sleep_reminder && (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-500">Thời gian:</span>
                            <input
                                type="time"
                                value={settings.sleep_reminder_time || '22:00'}
                                onChange={(e) => {
                                    const newSettings = { ...settings, sleep_reminder_time: e.target.value };
                                    setSettings(newSettings);
                                    if (isLoggedIn()) {
                                        saveNotificationSettings({ sleep_reminder_time: e.target.value });
                                    } else {
                                        localStorage.setItem('notification_settings', JSON.stringify(newSettings));
                                    }
                                }}
                                className="px-2 py-1 text-sm rounded-lg border border-gray-200 bg-white"
                            />
                        </div>
                    )}
                </SettingItem>

                {/* Breathing Reminder (optional) */}
                <SettingItem
                    icon={<Wind className="w-5 h-5" />}
                    title="Nhắc thở & thư giãn"
                    description="Nhắc mỗi 2 giờ để thở sâu"
                    enabled={settings.breathing_reminder || false}
                    onToggle={() => {
                        const newValue = !(settings.breathing_reminder || false);
                        const newSettings = { ...settings, breathing_reminder: newValue };
                        setSettings(newSettings);
                        
                        if (newValue && permissionStatus === 'granted') {
                            const id = scheduleBreathingReminder(120);
                            scheduledTimeoutsRef.current.push(id);
                        } else {
                            // Clear breathing reminders
                            scheduledTimeoutsRef.current.forEach(id => {
                                try { clearTimeout(id); } catch {}
                            });
                        }

                        if (isLoggedIn()) {
                            saveNotificationSettings({ breathing_reminder: newValue });
                        } else {
                            localStorage.setItem('notification_settings', JSON.stringify(newSettings));
                        }
                    }}
                />
            </div>

            {/* Test Button */}
            <button
                onClick={sendTestNotification}
                className="w-full py-3 text-center text-sm text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
            >
                Gửi thông báo test
            </button>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">
                    Thông báo sẽ được gửi qua trình duyệt. Hãy đảm bảo bạn không tắt thông báo trong cài đặt trình duyệt.
                </p>
            </div>

            {/* Saving indicator */}
            {saving && (
                <div className="fixed bottom-4 right-4 px-4 py-2 bg-gray-800 text-white text-sm rounded-full shadow-lg flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                </div>
            )}
        </div>
    );
}

// =============================================================================
// SETTING ITEM COMPONENT
// =============================================================================
function SettingItem({ icon, title, description, enabled, onToggle, children }) {
    return (
        <div className="p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${enabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-800">{title}</h3>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={onToggle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-500' : 'bg-gray-300'
                        }`}
                >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'left-7' : 'left-1'
                        }`} />
                </button>
            </div>
            {children}
        </div>
    );
}
