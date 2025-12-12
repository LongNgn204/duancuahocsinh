// src/components/chat/MicVisualizer.jsx
// Chú thích: Visualizer tần số (equalizer) theo thời gian thực khi dùng mic
// Sử dụng Web Audio API (AnalyserNode) và Canvas để vẽ 24 cột
import { useEffect, useRef } from 'react';

export default function MicVisualizer({ active = false, height = 36, bars = 24 }) {
  const canvasRef = useRef(null);
  const audioRef = useRef({ stream: null, ctx: null, analyser: null, raf: 0 });

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512; // độ phân giải tần số vừa đủ mượt
        source.connect(analyser);
        audioRef.current = { stream, ctx, analyser, raf: 0 };
        draw();
      } catch (e) {
        // Nếu user từ chối quyền mic, im lặng
      }
    }

    function stop() {
      const { stream, ctx, raf } = audioRef.current;
      if (raf) cancelAnimationFrame(raf);
      try { ctx && ctx.close(); } catch (_) {}
      try { stream && stream.getTracks().forEach(t => t.stop()); } catch (_) {}
      audioRef.current = { stream: null, ctx: null, analyser: null, raf: 0 };
      const c = canvasRef.current;
      if (c) {
        const g = c.getContext('2d');
        g.clearRect(0, 0, c.width, c.height);
      }
    }

    function draw() {
      const { analyser } = audioRef.current;
      const canvas = canvasRef.current;
      if (!analyser || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const g = canvas.getContext('2d');
      const bufLen = analyser.frequencyBinCount;
      const data = new Uint8Array(bufLen);

      const render = () => {
        audioRef.current.raf = requestAnimationFrame(render);
        analyser.getByteFrequencyData(data);

        g.clearRect(0, 0, w, h);
        // nền mờ theo theme surface
        g.fillStyle = 'rgba(0,0,0,0)';
        g.fillRect(0, 0, w, h);

        const barCount = bars;
        const step = Math.floor(bufLen / barCount);
        const barW = w / barCount - 2;
        for (let i = 0; i < barCount; i++) {
          // lấy max trong dải nhỏ để độ nhảy rõ hơn
          let v = 0;
          for (let j = i * step; j < (i + 1) * step; j++) v = Math.max(v, data[j] || 0);
          const barH = Math.max(2, (v / 255) * h);
          // màu dùng accent (xanh nhạt)
          g.fillStyle = '#6fbad0';
          const x = i * (barW + 2);
          g.fillRect(x, h - barH, barW, barH);
          // đỉnh mềm
          g.fillStyle = '#b0e0e6';
          g.fillRect(x, h - barH - 2, barW, 2);
        }
      };
      render();
    }

    if (active) start();
    else {
      // tắt khi không active
      try {
        const { ctx } = audioRef.current;
        if (ctx && ctx.state === 'running') ctx.suspend?.();
      } catch (_) {}
      // dọn canvas
      const c = canvasRef.current;
      if (c) {
        const g = c.getContext('2d');
        g.clearRect(0, 0, c.width, c.height);
      }
    }

    return () => {
      stop();
    };
  }, [active, bars, height]);

  return (
    <canvas
      ref={canvasRef}
      width={bars * 6 + (bars - 1) * 2}
      height={height}
      className="rounded-md bg-[--surface] border border-[--surface-border]"
      aria-hidden
    />
  );
}

