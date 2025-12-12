// src/pages/Journal.jsx
// Chú thích: Journal Page wrapper cho MoodJournal component
import MoodJournal from '../components/journal/MoodJournal';

export default function Journal() {
    return (
        <div className="pb-20 md:pb-0">
            <MoodJournal />
        </div>
    );
}
