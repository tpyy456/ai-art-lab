import { useEffect, useRef, useState } from 'react';

// 首页背景音乐控件（轻量版）：原生 <audio>，不创建 AudioContext / AnalyserNode，
// 不做频谱/可视化，不新增 Canvas / RAF / 依赖。仅「点击播放 / 暂停 + 状态显示」。
// 音频缺失时显示 AUDIO SOURCE MISSING，不报错；卸载时暂停并清理引用。
const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/home-ambient.mp3`;
const DEFAULT_VOLUME = 0.25;

type AudioStatus = 'checking' | 'missing' | 'paused' | 'playing';

function AudioDock() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>('checking');

  // 探测音频是否存在。vite 对缺失的 public 文件会回退到 index.html，
  // 所以除了 res.ok 还要校验 content-type 不是 html，避免把 HTML 当音频。
  useEffect(() => {
    let cancelled = false;
    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then((res) => {
        const type = (res.headers.get('content-type') || '').toLowerCase();
        const looksAudio = res.ok && type.length > 0 && !type.includes('text/html');
        if (!cancelled) setStatus(looksAudio ? 'paused' : 'missing');
      })
      .catch(() => {
        if (!cancelled) setStatus('missing');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 卸载时停止音乐并清理引用（首页进入 LAB → Hero 卸载 → 此处触发 → 音乐停止）。
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        try {
          audio.load();
        } catch {
          // ignore
        }
      }
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || status === 'missing' || status === 'checking') return;

    if (audio.paused) {
      audio.volume = DEFAULT_VOLUME;
      const result = audio.play();
      if (result && typeof result.then === 'function') {
        result
          .then(() => setStatus('playing'))
          // 自动播放策略阻止 / 源失效 → 优雅兜底，不抛错卡页面
          .catch(() => setStatus('paused'));
      }
    } else {
      audio.pause();
      setStatus('paused');
    }
  };

  const isPlaying = status === 'playing';
  const disabled = status === 'missing' || status === 'checking';
  const label =
    status === 'playing'
      ? 'SIGNAL PLAYING'
      : status === 'missing'
        ? 'AUDIO SOURCE MISSING'
        : status === 'checking'
          ? 'AUDIO CHANNEL'
          : 'SOUND OFF';

  return (
    <div className="pointer-events-auto fixed bottom-6 left-5 z-40 sm:left-8 lg:left-14">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={`Audio channel: ${label}`}
        aria-pressed={isPlaying}
        className={`group inline-flex items-center gap-3 border bg-black/30 px-4 py-2.5 backdrop-blur-xl transition-colors duration-300 ${
          disabled ? 'cursor-not-allowed border-white/10' : 'border-white/15 hover:border-lab-red/60'
        }`}
      >
        {/* 细线圆环 + 红点指示，呼应 HUD / 大卫视觉语言，不做成普通播放器按钮 */}
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span
            className={`absolute inset-0 rounded-full border transition-colors duration-300 ${
              isPlaying ? 'border-lab-red/70' : 'border-white/25 group-hover:border-lab-red/50'
            }`}
          />
          <span
            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
              isPlaying ? 'bg-lab-red shadow-[0_0_10px_rgba(255,22,22,0.8)]' : 'bg-white/40'
            }`}
          />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[8px] uppercase tracking-[0.34em] text-white/35">Audio Channel</span>
          <span
            className={`text-[10px] font-medium uppercase tracking-[0.22em] transition-colors duration-300 ${
              status === 'missing' ? 'text-white/30' : isPlaying ? 'text-lab-red' : 'text-white/65'
            }`}
          >
            {label}
          </span>
        </span>
      </button>

      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        loop
        preload="none"
        onPlay={() => setStatus('playing')}
        onPause={() => setStatus((s) => (s === 'missing' ? s : 'paused'))}
        onError={() => setStatus('missing')}
      />
    </div>
  );
}

export default AudioDock;
