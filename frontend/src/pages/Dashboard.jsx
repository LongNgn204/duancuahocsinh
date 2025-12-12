// src/pages/Dashboard.jsx
// Chú thích: Dashboard dùng Card/Button theo design system
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Welcome from '../components/dashboard/Welcome';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-6">
        <Welcome />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/chat"><Button variant="secondary" className="w-full">💬 Chat</Button></Link>
          <Link to="/breathing"><Button variant="outline" className="w-full">🧘 Thở</Button></Link>
          <Link to="/gratitude"><Button variant="outline" className="w-full">🏺 Biết ơn</Button></Link>
          <Link to="/games"><Button variant="ghost" className="w-full">🎮 Game</Button></Link>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Gợi ý bắt đầu nhanh</h3>
        <ul className="list-disc pl-6 text-[15px] space-y-1">
          <li>Hít thở 30 giây với pattern 4-7-8.</li>
          <li>Viết 1 điều biết ơn hôm nay.</li>
          <li>Chia sẻ với bạn Đồng Hành điều bạn đang băn khoăn.</li>
        </ul>
      </Card>
    </div>
  );
}
