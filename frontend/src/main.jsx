import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { preconnectToApi } from './utils/preconnect'
import { initVersionManager } from './utils/version-manager'

// Preconnect đến API để giảm độ trễ kết nối ban đầu
preconnectToApi()

// Khởi tạo version manager để tự động clear cache khi có version mới
initVersionManager()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
