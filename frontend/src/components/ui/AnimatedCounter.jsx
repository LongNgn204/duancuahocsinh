// src/components/ui/AnimatedCounter.jsx
// Chú thích: Component hiển thị số với animation đếm từ 0 lên
import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function AnimatedCounter({ 
  value, 
  suffix = '', 
  prefix = '',
  duration = 2,
  className = '' 
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Parse numeric value from string like "10,000+" or "95%"
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  const hasSuffix = value.includes('+') || value.includes('%');
  const displaySuffix = hasSuffix ? value.replace(/[0-9,]/g, '') : suffix;
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime;
    let animationFrame;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * numericValue);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, numericValue, duration]);
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString('vi-VN');
  };
  
  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {prefix}{formatNumber(count)}{displaySuffix}
    </motion.span>
  );
}
