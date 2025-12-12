import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { preconnectToApi } from './utils/preconnect'

// Preconnect đến API để giảm độ trễ kết nối ban đầu
preconnectToApi()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
