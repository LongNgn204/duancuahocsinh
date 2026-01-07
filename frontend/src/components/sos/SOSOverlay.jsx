// src/components/sos/SOSOverlay.jsx
// Chú thích: Component SOS Overlay - Hiển thị khi phát hiện nguy cơ
// Phase 2: Emergency Support với hotlines và mini map

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone, X, Heart, MapPin, Bot,
    ChevronRight, AlertTriangle, Loader2, ExternalLink
} from 'lucide-react';
import { logSOSEvent } from '../../utils/api';

// =============================================================================
// HOTLINES DATA
// =============================================================================
const HOTLINES = [
    {
        id: 'national',
        name: 'Đường dây nóng hỗ trợ sức khỏe tâm thần',
        number: '1800 599 920',
        description: 'Miễn phí 24/7 - Bộ Y tế',
        color: 'red',
    },
    {
        id: 'child',
        name: 'Tổng đài bảo vệ trẻ em',
        number: '111',
        description: 'Miễn phí 24/7 - Trẻ em & Thanh thiếu niên',
        color: 'blue',
    },
    {
        id: 'student',
        name: 'Tư vấn tâm lý học đường',
        number: '1800 7267',
        description: 'Miễn phí - Hỗ trợ học sinh',
        color: 'green',
    },
];

// =============================================================================
// SOS OVERLAY COMPONENT
// =============================================================================
export default function SOSOverlay({
    isOpen,
    onClose,
    riskLevel = 'high', // 'critical' | 'high' | 'medium'
    triggerText = null
}) {
    const [activeTab, setActiveTab] = useState('hotline'); // 'hotline' | 'map' | 'chat'
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [locationAccuracy, setLocationAccuracy] = useState(null); // Độ chính xác (mét)
    const [watchId, setWatchId] = useState(null);

    // Log SOS event khi overlay mở
    useEffect(() => {
        if (isOpen) {
            logSOSEvent('overlay_opened', riskLevel, triggerText);
        }
    }, [isOpen, riskLevel, triggerText]);

    // Cleanup watchPosition khi unmount hoặc đóng overlay
    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    // Get user location với độ chính xác cao nhất
    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('Trình duyệt không hỗ trợ định vị');
            return;
        }

        setLocationLoading(true);
        setLocationError(null);

        // Geolocation options cho độ chính xác cao nhất
        const geoOptions = {
            enableHighAccuracy: true, // Sử dụng GPS thật (không dùng WiFi/IP)
            timeout: 30000,           // Chờ tối đa 30 giây
            maximumAge: 0             // Không dùng cache, lấy vị trí mới
        };

        // Sử dụng watchPosition để liên tục cập nhật vị trí chính xác hơn
        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                // Chỉ cập nhật nếu accuracy tốt hơn hoặc chưa có vị trí
                if (!userLocation || accuracy < (locationAccuracy || Infinity)) {
                    setUserLocation({ lat: latitude, lng: longitude });
                    setLocationAccuracy(Math.round(accuracy)); // accuracy in meters
                    setLocationLoading(false);

                    // Log map view với location (chỉ log lần đầu)
                    if (!userLocation) {
                        logSOSEvent('map_viewed', riskLevel, null, {
                            lat: latitude,
                            lng: longitude,
                            accuracy: Math.round(accuracy)
                        });
                    }
                }

                // Nếu accuracy đủ tốt (< 50m), ngừng watch để tiết kiệm pin
                if (accuracy < 50) {
                    navigator.geolocation.clearWatch(id);
                    setWatchId(null);
                }
            },
            (error) => {
                setLocationLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('Bạn đã từ chối chia sẻ vị trí. Vui lòng bật GPS trong cài đặt trình duyệt.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Không thể xác định vị trí. Hãy đảm bảo GPS đã bật trên thiết bị.');
                        break;
                    case error.TIMEOUT:
                        setLocationError('Quá thời gian xác định vị trí. Thử ra ngoài trời hoặc nơi thoáng hơn.');
                        break;
                    default:
                        setLocationError('Lỗi không xác định khi lấy vị trí');
                }
                if (watchId !== null) {
                    navigator.geolocation.clearWatch(watchId);
                    setWatchId(null);
                }
            },
            geoOptions
        );

        setWatchId(id);
    }, [riskLevel, userLocation, locationAccuracy, watchId]);

    // Call hotline và log event
    const callHotline = useCallback((hotline) => {
        logSOSEvent('hotline_clicked', riskLevel, null, null, { hotline_id: hotline.id });
        window.location.href = `tel:${hotline.number.replace(/\s/g, '')}`;
    }, [riskLevel]);

    // Generate Google Maps URL
    const getHospitalMapUrl = useCallback(() => {
        if (!userLocation) {
            return 'https://www.google.com/maps/search/bệnh+viện+tâm+thần';
        }
        return `https://www.google.com/maps/search/bệnh+viện+tâm+thần/@${userLocation.lat},${userLocation.lng},14z`;
    }, [userLocation]);

    // Don't render if not open
    if (!isOpen) return null;

    const isCritical = riskLevel === 'critical' || riskLevel === 'red';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`
            relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden
            ${isCritical ? 'border-2 border-red-500' : 'border border-gray-200'}
          `}
                >
                    {/* Critical Warning Banner */}
                    {isCritical && (
                        <div className="bg-red-500 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Chúng mình lo lắng cho bạn. Hãy liên hệ ngay!
                        </div>
                    )}

                    {/* Header */}
                    <div className="p-6 text-center border-b border-gray-100">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Heart className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Bạn không đơn độc
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Mình luôn ở đây và sẵn sàng lắng nghe bạn
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <TabButton
                            active={activeTab === 'hotline'}
                            onClick={() => setActiveTab('hotline')}
                            icon={<Phone className="w-4 h-4" />}
                            label="Hotline"
                        />
                        <TabButton
                            active={activeTab === 'map'}
                            onClick={() => { setActiveTab('map'); getUserLocation(); }}
                            icon={<MapPin className="w-4 h-4" />}
                            label="Bản đồ"
                        />
                        <TabButton
                            active={activeTab === 'chat'}
                            onClick={() => setActiveTab('chat')}
                            icon={<Bot className="w-4 h-4" />}
                            label="Chat"
                        />
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {/* Hotline Tab */}
                        {activeTab === 'hotline' && (
                            <div className="space-y-3">
                                {HOTLINES.map((hotline) => (
                                    <button
                                        key={hotline.id}
                                        onClick={() => callHotline(hotline)}
                                        className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all text-left flex items-center justify-between group touch-target"
                                        style={{ minHeight: '80px' }} // Đảm bảo vùng chạm đủ lớn
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 text-base">
                                                {hotline.name}
                                            </p>
                                            <p className="text-xl font-bold text-purple-600 mt-1">
                                                {hotline.number}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {hotline.description}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-green-500 text-white group-hover:scale-110 group-active:scale-95 transition-transform flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Map Tab */}
                        {activeTab === 'map' && (
                            <div className="space-y-4">
                                {/* GPS Permission Prompt */}
                                {!userLocation && !locationLoading && !locationError && (
                                    <div className="text-center py-6 space-y-4">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                                            <MapPin className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 mb-2">
                                                Bật định vị để tìm hỗ trợ gần bạn
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Chúng mình cần quyền truy cập vị trí để tìm bệnh viện và cơ sở hỗ trợ tâm lý gần nhất
                                            </p>
                                        </div>
                                        <button
                                            onClick={getUserLocation}
                                            className="w-full py-4 min-h-[48px] bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all touch-target"
                                        >
                                            <MapPin className="w-5 h-5" />
                                            Cho phép định vị
                                        </button>
                                        <p className="text-xs text-gray-400">
                                            Vị trí chỉ được sử dụng để tìm kiếm, không lưu trữ
                                        </p>
                                    </div>
                                )}

                                {/* Loading State */}
                                {locationLoading && (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                        <span className="text-gray-600">Đang xác định vị trí...</span>
                                        <p className="text-xs text-gray-400">Vui lòng cho phép truy cập GPS</p>
                                    </div>
                                )}

                                {/* Error State */}
                                {locationError && (
                                    <div className="text-center py-6 space-y-4">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-amber-600 mb-2">
                                                {locationError}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Để bật GPS: Vào Cài đặt trình duyệt → Quyền riêng tư → Vị trí → Cho phép
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={getUserLocation}
                                                className="flex-1 py-3 min-h-[48px] bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl text-sm font-medium transition-all touch-target"
                                            >
                                                Thử lại
                                            </button>
                                            <a
                                                href="https://www.google.com/maps/search/bệnh+viện+tâm+thần"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-3 min-h-[48px] bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 rounded-xl text-sm font-medium text-center transition-all touch-target flex items-center justify-center"
                                            >
                                                Tìm thủ công
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Map Display - Only when location available */}
                                {userLocation && !locationLoading && (
                                    <>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Đã xác định vị trí của bạn
                                            </p>
                                            {/* Hiển thị độ chính xác GPS */}
                                            {locationAccuracy && (
                                                <p className={`text-xs flex items-center justify-center gap-1 ${locationAccuracy < 50
                                                        ? 'text-green-500'
                                                        : locationAccuracy < 100
                                                            ? 'text-yellow-500'
                                                            : 'text-red-500'
                                                    }`}>
                                                    📍 Độ chính xác: ±{locationAccuracy}m
                                                    {locationAccuracy < 50 && ' (Rất tốt)'}
                                                    {locationAccuracy >= 50 && locationAccuracy < 100 && ' (Tốt)'}
                                                    {locationAccuracy >= 100 && ' (Trung bình)'}
                                                </p>
                                            )}
                                        </div>

                                        {/* OpenStreetMap Preview (FREE) */}
                                        <div className="w-full h-48 rounded-xl overflow-hidden relative border border-gray-200 group">
                                            <iframe
                                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.03}%2C${userLocation.lat - 0.03}%2C${userLocation.lng + 0.03}%2C${userLocation.lat + 0.03}&layer=mapnik&marker=${userLocation.lat}%2C${userLocation.lng}`}
                                                className="w-full h-full border-0"
                                                title="Vị trí của bạn"
                                                loading="lazy"
                                            />
                                            {/* OSM Attribution */}
                                            <div className="absolute bottom-1 left-1 text-xs bg-white/80 px-1 rounded">
                                                © OpenStreetMap
                                            </div>
                                            {/* Fullscreen button */}
                                            <button
                                                onClick={() => {
                                                    const url = `https://www.openstreetmap.org/?mlat=${userLocation.lat}&mlon=${userLocation.lng}&zoom=14`;
                                                    window.open(url, '_blank', 'noopener,noreferrer');
                                                }}
                                                className="absolute top-2 right-2 w-10 h-10 min-w-[48px] min-h-[48px] bg-white/90 hover:bg-white rounded-lg shadow-md flex items-center justify-center transition-colors touch-target"
                                                title="Xem bản đồ toàn màn hình"
                                            >
                                                <ExternalLink className="w-5 h-5 text-gray-700" />
                                            </button>
                                        </div>

                                        {/* Google Maps Search Button */}
                                        <a
                                            href={getHospitalMapUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-4 min-h-[48px] flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl font-medium transition-all touch-target"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            Mở Google Maps - Tìm bệnh viện gần nhất
                                        </a>

                                        {/* Alternative options */}
                                        <div className="flex gap-2 text-sm">
                                            <a
                                                href={`https://www.google.com/maps/search/phòng+khám+tâm+lý/@${userLocation.lat},${userLocation.lng},14z`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-3 min-h-[48px] bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 rounded-xl text-center font-medium transition-all touch-target flex items-center justify-center"
                                            >
                                                Phòng khám tâm lý
                                            </a>
                                            <a
                                                href={`https://www.google.com/maps/search/bệnh+viện/@${userLocation.lat},${userLocation.lng},14z`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-3 min-h-[48px] bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 rounded-xl text-center font-medium transition-all touch-target flex items-center justify-center"
                                            >
                                                Bệnh viện chung
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Chat Tab */}
                        {activeTab === 'chat' && (
                            <div className="text-center py-6 space-y-4">
                                <p className="text-gray-600">
                                    Bạn có thể chia sẻ với AI của chúng mình bất cứ điều gì.
                                    Mình sẽ lắng nghe và không phán xét.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    Tiếp tục trò chuyện
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Close Button - Touch-friendly */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-12 h-12 min-w-[48px] min-h-[48px] rounded-full hover:bg-gray-100 active:scale-90 transition-all flex items-center justify-center touch-target"
                        aria-label="Đóng"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>

                    {/* Footer */}
                    <div className="p-4 bg-gray-50 text-center">
                        <p className="text-xs text-gray-400">
                            Cuộc sống của bạn rất có giá trị 💜
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// =============================================================================
// TAB BUTTON COMPONENT
// =============================================================================
function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-4 min-h-[48px] flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-95 touch-target ${active
                ? 'text-purple-600 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700'
                }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

// =============================================================================
// EXPORTS
// =============================================================================
export { HOTLINES };
