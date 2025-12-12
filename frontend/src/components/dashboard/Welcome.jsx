// src/components/dashboard/Welcome.jsx
// Chú thích: Màn hình chào cơ bản; sẽ mở rộng mood selector sau
export default function Welcome({ userName }) {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-primary">Chào {userName || 'bạn'} 👋</h1>
      <p className="text-gray-600 mt-4">Hôm nay bạn cảm thấy thế nào?</p>
      {/* TODO: Mood selector: 😊 😐 😢 😡 */}
    </div>
  );
}

