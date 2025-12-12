// src/components/resources/ResourceLibrary.jsx
// Chú thích: Resource Library v1.0 - Thư viện bài viết tâm lý học đường
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Library, Search, BookOpen, Clock, Heart, Brain,
    Users, Lightbulb, Star, ChevronRight, X, Bookmark
} from 'lucide-react';

// Categories
const CATEGORIES = [
    { id: 'all', label: 'Tất cả', icon: Library },
    { id: 'stress', label: 'Căng thẳng', icon: Brain },
    { id: 'relationships', label: 'Quan hệ', icon: Users },
    { id: 'study', label: 'Học tập', icon: BookOpen },
    { id: 'self', label: 'Bản thân', icon: Heart },
];

// Articles data
const ARTICLES = [
    {
        id: '1',
        title: '5 cách đối phó với áp lực thi cử',
        excerpt: 'Học cách quản lý stress trong mùa thi với những phương pháp đơn giản nhưng hiệu quả.',
        category: 'stress',
        readTime: 5,
        featured: true,
        content: `
# 5 cách đối phó với áp lực thi cử

Mùa thi là thời điểm căng thẳng với nhiều học sinh. Dưới đây là 5 cách giúp bạn vượt qua:

## 1. Lập kế hoạch học tập rõ ràng
Chia nhỏ nội dung cần ôn thành từng phần và phân bổ thời gian hợp lý.

## 2. Nghỉ ngơi đủ giấc
Ngủ đủ 7-8 tiếng mỗi đêm giúp não bộ hoạt động tốt hơn.

## 3. Tập thể dục đều đặn
30 phút vận động mỗi ngày giúp giảm cortisol (hormone stress).

## 4. Ăn uống lành mạnh
Tránh đồ ăn nhanh, uống đủ nước và ăn nhiều rau xanh.

## 5. Thực hành thở sâu
Khi cảm thấy lo lắng, hãy hít thở sâu 4 giây, giữ 4 giây, thở ra 4 giây.

> Nhớ rằng: Kết quả thi không định nghĩa giá trị của bạn!
    `
    },
    {
        id: '2',
        title: 'Cách xử lý khi bị bắt nạt',
        excerpt: 'Những bước cần làm nếu bạn hoặc bạn bè đang bị bắt nạt ở trường.',
        category: 'relationships',
        readTime: 7,
        featured: true,
        content: `
# Cách xử lý khi bị bắt nạt

Bắt nạt là hành vi không thể chấp nhận được. Nếu bạn đang gặp phải:

## Những dấu hiệu của bắt nạt
- Bị trêu chọc, xúc phạm liên tục
- Bị cô lập, tẩy chay khỏi nhóm
- Bị đe dọa, ép buộc
- Bị lan truyền tin đồn sai sự thật

## Bạn nên làm gì?

### 1. Không im lặng
Nói với người lớn đáng tin cậy: thầy cô, phụ huynh, hoặc tư vấn viên.

### 2. Ghi lại bằng chứng
Chụp ảnh, lưu tin nhắn nếu bị bắt nạt online.

### 3. Tránh đáp trả bằng bạo lực
Điều này chỉ làm tình hình tệ hơn.

### 4. Tìm sự hỗ trợ
Đường dây nóng: 111 (Bảo vệ trẻ em)

> Bạn không đơn độc. Có người sẵn sàng giúp đỡ bạn!
    `
    },
    {
        id: '3',
        title: 'Xây dựng sự tự tin',
        excerpt: 'Những thói quen hàng ngày giúp bạn yêu thương bản thân và tự tin hơn.',
        category: 'self',
        readTime: 6,
        content: `
# Xây dựng sự tự tin

Tự tin không phải là nghĩ mình hoàn hảo, mà là chấp nhận bản thân với mọi khuyết điểm.

## 5 thói quen xây dựng tự tin

### 1. Nói tốt về bản thân
Mỗi sáng, nhìn vào gương và nói điều tích cực về mình.

### 2. Đặt mục tiêu nhỏ và hoàn thành
Cảm giác thành công tích lũy sẽ tăng sự tự tin.

### 3. Học điều mới
Mỗi kỹ năng mới là một bước tiến cho sự tự tin.

### 4. Chăm sóc cơ thể
Tập thể dục, ăn uống lành mạnh, ngủ đủ giấc.

### 5. Bao quanh với người tích cực
Tránh xa những người hay chỉ trích, so sánh.

> "Bạn là phiên bản duy nhất của chính mình. Đó là siêu năng lực của bạn!"
    `
    },
    {
        id: '4',
        title: 'Kỹ năng quản lý thời gian',
        excerpt: 'Làm sao để cân bằng học tập, hoạt động ngoại khóa và thời gian nghỉ ngơi.',
        category: 'study',
        readTime: 8,
        content: `
# Kỹ năng quản lý thời gian

Thời gian là tài nguyên quý giá nhất. Học cách sử dụng hiệu quả.

## Ma trận Eisenhower

Chia công việc thành 4 nhóm:
1. **Khẩn cấp + Quan trọng**: Làm ngay
2. **Quan trọng + Không khẩn cấp**: Lên lịch
3. **Khẩn cấp + Không quan trọng**: Ủy quyền
4. **Không khẩn cấp + Không quan trọng**: Bỏ qua

## Kỹ thuật Pomodoro
- Học 25 phút, nghỉ 5 phút
- Sau 4 vòng, nghỉ dài 15-30 phút

## Tránh xao nhãng
- Tắt thông báo điện thoại khi học
- Dùng app chặn mạng xã hội
- Tạo không gian học tập riêng

> Tip: Dùng Focus Timer trong app để áp dụng Pomodoro!
    `
    },
    {
        id: '5',
        title: 'Hiểu về lo âu và cách đối phó',
        excerpt: 'Lo âu là gì? Khi nào cần tìm sự giúp đỡ? Các cách tự giúp bản thân.',
        category: 'stress',
        readTime: 10,
        content: `
# Hiểu về lo âu

Lo lắng là cảm xúc bình thường, nhưng khi nó ảnh hưởng đến cuộc sống hàng ngày, đó có thể là dấu hiệu cần chú ý.

## Triệu chứng lo âu
- Tim đập nhanh
- Khó thở, cảm giác nghẹt
- Suy nghĩ tiêu cực lặp đi lặp lại
- Khó ngủ
- Tránh né các tình huống xã hội

## Khi nào cần tìm giúp đỡ?
- Lo âu kéo dài hơn 2 tuần
- Ảnh hưởng đến học tập, quan hệ
- Có suy nghĩ tự làm hại

## Cách tự giúp
1. **Kỹ thuật 5-4-3-2-1**: Nhận diện 5 thứ bạn thấy, 4 thứ bạn chạm, 3 thứ bạn nghe, 2 thứ bạn ngửi, 1 thứ bạn nếm.
2. **Thở hộp**: Hít 4s, giữ 4s, thở ra 4s, giữ 4s
3. **Viết nhật ký**: Ghi lại suy nghĩ để "xuất" chúng ra ngoài

> Đường dây hỗ trợ: 1800 599 920 (miễn phí, 24/7)
    `
    },
    {
        id: '6',
        title: 'Cách kết bạn mới',
        excerpt: 'Bí quyết xây dựng tình bạn lành mạnh và vượt qua sự nhút nhát.',
        category: 'relationships',
        readTime: 5,
        content: `
# Cách kết bạn mới

Ai cũng có thể kết bạn, ngay cả khi bạn là người nhút nhát.

## Bước đầu tiên
- Mỉm cười và chào hỏi
- Đặt câu hỏi về họ (mọi người thích nói về mình)
- Tìm điểm chung: sở thích, lớp học, v.v.

## Duy trì tình bạn
- Lắng nghe nhiều hơn nói
- Nhớ những chi tiết nhỏ
- Có mặt khi họ cần

## Tình bạn lành mạnh là gì?
✅ Tôn trọng lẫn nhau
✅ Chia sẻ cả vui lẫn buồn
✅ Không ép buộc, phán xét
❌ Một chiều: chỉ bạn cho đi
❌ Độc hại: khiến bạn cảm thấy tệ hơn

> "Để có bạn tốt, trước tiên hãy là bạn tốt."
    `
    },
];

// Storage for bookmarks
const BOOKMARKS_KEY = 'resource_bookmarks_v1';

function loadBookmarks() {
    try {
        const raw = localStorage.getItem(BOOKMARKS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
}

function saveBookmarks(bookmarks) {
    try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (_) { }
}

export default function ResourceLibrary() {
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [bookmarks, setBookmarks] = useState(loadBookmarks);

    // Filter articles
    const filteredArticles = useMemo(() => {
        let articles = ARTICLES;

        if (category !== 'all') {
            articles = articles.filter(a => a.category === category);
        }

        if (search) {
            const q = search.toLowerCase();
            articles = articles.filter(a =>
                a.title.toLowerCase().includes(q) ||
                a.excerpt.toLowerCase().includes(q)
            );
        }

        return articles;
    }, [category, search]);

    // Featured articles
    const featuredArticles = ARTICLES.filter(a => a.featured);

    // Toggle bookmark
    const toggleBookmark = (id) => {
        const updated = bookmarks.includes(id)
            ? bookmarks.filter(b => b !== id)
            : [...bookmarks, id];
        setBookmarks(updated);
        saveBookmarks(updated);
    };

    const isBookmarked = (id) => bookmarks.includes(id);

    return (
        <div className="min-h-[70vh] relative pb-20 md:pb-0">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <Library className="w-8 h-8 text-[--brand]" />
                        <span className="gradient-text">Thư viện Kiến thức</span>
                    </h1>
                    <p className="text-[--muted] text-sm mt-1">
                        Bài viết hữu ích về tâm lý học đường
                    </p>
                </motion.div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--muted]" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 glass rounded-xl text-sm outline-none focus:ring-2 focus:ring-[--brand]"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`
                px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all
                ${category === cat.id
                                    ? 'bg-[--brand] text-white'
                                    : 'glass hover:bg-white/50'
                                }
              `}
                        >
                            <cat.icon size={16} />
                            <span className="text-sm">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Featured */}
                {category === 'all' && !search && (
                    <div className="space-y-3">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Star className="w-4 h-4 text-[--accent]" />
                            Nổi bật
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {featuredArticles.map(article => (
                                <Card
                                    key={article.id}
                                    variant="interactive"
                                    onClick={() => setSelectedArticle(article)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <Badge variant="accent" size="sm" className="mb-2">
                                                {CATEGORIES.find(c => c.id === article.category)?.label}
                                            </Badge>
                                            <h3 className="font-semibold text-[--text] mb-1">{article.title}</h3>
                                            <p className="text-sm text-[--muted] line-clamp-2">{article.excerpt}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-[--muted]">
                                        <Clock size={12} />
                                        <span>{article.readTime} phút đọc</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Articles list */}
                <div className="space-y-3">
                    {(category !== 'all' || search) && (
                        <h2 className="font-semibold">
                            {filteredArticles.length} bài viết
                        </h2>
                    )}
                    {filteredArticles.map(article => (
                        <Card
                            key={article.id}
                            variant="interactive"
                            onClick={() => setSelectedArticle(article)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <Badge variant="primary" size="sm" className="mb-2">
                                        {CATEGORIES.find(c => c.id === article.category)?.label}
                                    </Badge>
                                    <h3 className="font-semibold text-[--text] mb-1">{article.title}</h3>
                                    <p className="text-sm text-[--muted] line-clamp-2">{article.excerpt}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-[--muted]">
                                        <Clock size={12} />
                                        <span>{article.readTime} phút đọc</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-[--muted] shrink-0" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Article Modal */}
            <AnimatePresence>
                {selectedArticle && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedArticle(null)}
                    >
                        <motion.div
                            className="max-w-2xl mx-auto my-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <Card variant="elevated" size="lg">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <Badge variant="primary">
                                        {CATEGORIES.find(c => c.id === selectedArticle.category)?.label}
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => toggleBookmark(selectedArticle.id)}
                                        >
                                            <Bookmark
                                                size={18}
                                                className={isBookmarked(selectedArticle.id) ? 'fill-current text-[--accent]' : ''}
                                            />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => setSelectedArticle(null)}
                                        >
                                            <X size={18} />
                                        </Button>
                                    </div>
                                </div>

                                <h1 className="text-xl font-bold text-[--text] mb-2">
                                    {selectedArticle.title}
                                </h1>

                                <div className="flex items-center gap-2 text-sm text-[--muted] mb-6">
                                    <Clock size={14} />
                                    <span>{selectedArticle.readTime} phút đọc</span>
                                </div>

                                {/* Content */}
                                <div className="prose prose-sm max-w-none text-[--text-secondary]">
                                    {selectedArticle.content.split('\n').map((line, i) => {
                                        if (line.startsWith('# ')) {
                                            return <h1 key={i} className="text-xl font-bold text-[--text] mt-6 mb-3">{line.slice(2)}</h1>;
                                        }
                                        if (line.startsWith('## ')) {
                                            return <h2 key={i} className="text-lg font-semibold text-[--text] mt-4 mb-2">{line.slice(3)}</h2>;
                                        }
                                        if (line.startsWith('### ')) {
                                            return <h3 key={i} className="font-semibold text-[--text] mt-3 mb-1">{line.slice(4)}</h3>;
                                        }
                                        if (line.startsWith('> ')) {
                                            return (
                                                <blockquote key={i} className="border-l-4 border-[--brand] pl-4 py-2 my-4 bg-[--brand]/5 rounded-r-lg italic">
                                                    {line.slice(2)}
                                                </blockquote>
                                            );
                                        }
                                        if (line.startsWith('- ')) {
                                            return <li key={i} className="ml-4">{line.slice(2)}</li>;
                                        }
                                        if (line.startsWith('✅') || line.startsWith('❌')) {
                                            return <p key={i} className="ml-4">{line}</p>;
                                        }
                                        if (line.trim() === '') {
                                            return <br key={i} />;
                                        }
                                        return <p key={i} className="my-2">{line}</p>;
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
