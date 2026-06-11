import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './intro.css';

interface IntroOverlayProps {
  onComplete: () => void;
}

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clampValue = (min: number, value: number, max: number) => gsap.utils.clamp(min, max, value);
    const shortestViewportSide = () => Math.min(window.innerWidth, window.innerHeight);
    const getRestRadius = () => clampValue(92, shortestViewportSide() * 0.12, 132);
    const getPressRadius = () => clampValue(188, shortestViewportSide() * 0.31, 300);

    const state = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      radius: getRestRadius(),
      water: 0,
      waterPhase: 0
    };

    const fgLayer = container!.querySelector('#fg-layer') as HTMLElement;
    const edgeLayer = container!.querySelector('#edge-layer') as HTMLElement;
    const glassRim = container!.querySelector('#glass-rim') as HTMLElement;
    const bgLayer = container!.querySelector('.bg-layer') as HTMLElement;
    const waterNoise = container!.querySelector('#intro-water-noise');
    const waterDisplacement = container!.querySelector('#intro-water-displacement');
    const waveRed = container!.querySelector('.wave-red') as HTMLElement;
    const waveBlack = container!.querySelector('.wave-black') as HTMLElement;
    const rippleCanvas = container!.querySelector('#transition-ripple-canvas') as HTMLCanvasElement;
    const rippleContext = rippleCanvas?.getContext('2d');
    const enterButtons = Array.from(container!.querySelectorAll('.bottom-icon')) as HTMLElement[];

    let isInteracting = false;
    let lastRipplePoint = { x: state.x, y: state.y };
    let lastRippleAt = 0;
    let lastWaterFrame = performance.now();
    let isTransitioning = false;
    let hasEntered = false;
    let transitionTimeline: gsap.core.Timeline | null = null;
    let transitionFinalizeTimer: number | null = null;
    let cleanupLensSystem = () => {};
    let waterIntervalId: number | null = null;
    let isMobilePerformance = window.matchMedia('(max-width: 760px)').matches;
    let lastLensPaintAt = 0;
    let lastPaintedLens = { x: Number.NaN, y: Number.NaN, radius: Number.NaN };

    const updateLens = () => {
      if (isTransitioning || hasEntered) return;

      const now = performance.now();
      if (isMobilePerformance && now - lastLensPaintAt < 1000 / 30) return;

      const paintedX = Math.round(state.x * 10) / 10;
      const paintedY = Math.round(state.y * 10) / 10;
      const paintedRadius = Math.round(state.radius * 10) / 10;
      if (
        paintedX === lastPaintedLens.x &&
        paintedY === lastPaintedLens.y &&
        paintedRadius === lastPaintedLens.radius
      ) {
        return;
      }

      lastLensPaintAt = now;
      lastPaintedLens = { x: paintedX, y: paintedY, radius: paintedRadius };

      const lensX = `${paintedX}px`;
      const lensY = `${paintedY}px`;
      const lensRadius = `${paintedRadius}px`;
      container.style.setProperty('--lens-x', lensX);
      container.style.setProperty('--lens-y', lensY);
      container.style.setProperty('--lens-radius', lensRadius);

      fgLayer.style.clipPath = `circle(${paintedRadius}px at ${paintedX}px ${paintedY}px)`;

      const innerRadius = paintedRadius;
      const edgeSoftness = Math.max(10, paintedRadius * 0.1);
      const outerRadius = paintedRadius + Math.max(40, paintedRadius * 0.34);
      const maskStr = `radial-gradient(circle at ${paintedX}px ${paintedY}px, transparent ${Math.max(0, innerRadius - edgeSoftness)}px, rgba(0,0,0,0.42) ${innerRadius - edgeSoftness * 0.25}px, rgba(0,0,0,1) ${innerRadius + edgeSoftness * 0.5}px, rgba(0,0,0,0.48) ${outerRadius - edgeSoftness}px, transparent ${outerRadius}px)`;

      edgeLayer.style.webkitMaskImage = maskStr;
      edgeLayer.style.maskImage = maskStr;

      const size = paintedRadius * 2;
      gsap.set(glassRim, {
        x: paintedX,
        y: paintedY,
        xPercent: -50,
        yPercent: -50,
        width: size,
        height: size
      });
    };

    const shouldIgnorePointer = (event: PointerEvent) => (event.target as Element).closest?.('.bottom-icon');
    const setPressing = (isPressing: boolean) => containerRef.current?.classList.toggle('is-pressing', isPressing);
    const setWaterActive = (isActive: boolean) => containerRef.current?.classList.toggle('is-water-active', isActive);

    const updateWaterRipple = () => {
      if (isTransitioning || hasEntered) return;
      if (!waterNoise || !waterDisplacement) return;

      const now = performance.now();
      const deltaSeconds = Math.min(0.05, Math.max(0, (now - lastWaterFrame) / 1000));
      lastWaterFrame = now;

      if (state.water <= 0.02) {
        state.water = 0;
        waterDisplacement.setAttribute('scale', '0');
        setWaterActive(false);
        if (waterIntervalId !== null) {
          window.clearInterval(waterIntervalId);
          waterIntervalId = null;
        }
        return;
      }

      if (isMobilePerformance) {
        state.water *= Math.pow(0.08, deltaSeconds / 0.72);
        return;
      }

      const speed = gsap.ticker.deltaRatio(60);
      state.waterPhase += 0.034 * speed;

      const horizontalFrequency = 0.01 + Math.sin(state.waterPhase) * 0.003;
      const verticalFrequency = 0.044 + Math.cos(state.waterPhase * 0.74) * 0.01;

      waterNoise.setAttribute('baseFrequency', `${horizontalFrequency.toFixed(4)} ${verticalFrequency.toFixed(4)}`);
      waterDisplacement.setAttribute('scale', state.water.toFixed(2));

      state.water *= Math.pow(0.08, deltaSeconds / 1.25);
    }

    const ensureWaterLoop = () => {
      if (waterIntervalId !== null) return;
      lastWaterFrame = performance.now();
      waterIntervalId = window.setInterval(updateWaterRipple, isMobilePerformance ? 1000 / 24 : 1000 / 60);
    };

    const createCircularText = (selector: string) => {
      const rollTexts = container.querySelectorAll(selector);

      rollTexts.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const text = htmlEl.innerText;
        htmlEl.innerHTML = '';
        htmlEl.setAttribute('aria-hidden', 'true');

        const radius = 45;
        for (let i = 0; i < text.length; i++) {
          const span = document.createElement('span');
          const angle = (i / text.length) * 360;
          const radians = (angle - 90) * Math.PI / 180;
          const x = Math.cos(radians) * radius;
          const y = Math.sin(radians) * radius;

          span.innerText = text[i];
          span.style.position = 'absolute';
          span.style.left = `calc(50% + ${x.toFixed(3)}px)`;
          span.style.top = `calc(50% + ${y.toFixed(3)}px)`;
          span.style.lineHeight = '1';
          span.style.transformOrigin = '50% 50%';
          span.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
          htmlEl.appendChild(span);
        }
      });
    }

    createCircularText('.bg-roll-text');
    createCircularText('.bg-roll-text-clone');
    createCircularText('.fg-roll-text');
    updateLens();

    gsap.set(glassRim, { xPercent: -50, yPercent: -50 });

    const mm = gsap.matchMedia();
    mm.add(
      {
        isDesktop: '(min-width: 761px)',
        isMobile: '(max-width: 760px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const { isMobile, reduceMotion } = context.conditions as {
          isMobile?: boolean;
          reduceMotion?: boolean;
        };
        isMobilePerformance = Boolean(isMobile);

        const motionDuration = reduceMotion ? 0.01 : isMobilePerformance ? 0.28 : 0.18;
        const radiusDuration = reduceMotion ? 0.01 : isMobilePerformance ? 0.42 : 0.56;
        const xTo = gsap.quickTo(state, 'x', { duration: motionDuration, ease: 'power3.out' });
        const yTo = gsap.quickTo(state, 'y', { duration: motionDuration, ease: 'power3.out' });
        const rTo = gsap.quickTo(state, 'radius', { duration: radiusDuration, ease: 'back.out(1.4)' });
        let lastMobilePointerAt = 0;

        gsap.ticker.add(updateLens);

        const disturbWater = (strength = 10) => {
          if (isTransitioning || hasEntered || reduceMotion) return;
          setWaterActive(true);
          if (!isMobilePerformance && state.water <= 0.02) {
            waterNoise?.setAttribute('seed', String(Math.floor(performance.now()) % 99));
          }
          const maxStrength = isMobilePerformance ? 6 : 12;
          state.water = clampValue(3, Math.max(state.water, strength), maxStrength);
          ensureWaterLoop();
          updateWaterRipple();
        };

        const stopWaterRipple = () => {
          if (hasEntered) return;
          if (reduceMotion) {
            state.water = 0;
            setWaterActive(false);
            updateWaterRipple();
            return;
          }
          state.water = Math.min(state.water, 2);
          updateWaterRipple();
        };

        const handlePointerMove = (event: PointerEvent) => {
          if (isTransitioning || hasEntered) return;

          const now = performance.now();
          if (isMobilePerformance) {
            if (!isInteracting || now - lastMobilePointerAt < 42) return;
            lastMobilePointerAt = now;
          }

          xTo(event.clientX);
          yTo(event.clientY);

          if (!isInteracting || reduceMotion) return;

          const dx = event.clientX - lastRipplePoint.x;
          const dy = event.clientY - lastRipplePoint.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 4 && now - lastRippleAt > 45) {
            disturbWater(clampValue(4, distance * 0.55, isMobilePerformance ? 6 : 12));
            lastRipplePoint = { x: event.clientX, y: event.clientY };
            lastRippleAt = now;
          }
        };

        const openLens = (point = { x: state.x, y: state.y }) => {
          if (isTransitioning || hasEntered) return;
          isInteracting = true;
          lastRipplePoint = point;
          lastRippleAt = performance.now();
          setPressing(true);
          disturbWater(10);
          rTo(getPressRadius());
        };

        const closeLens = () => {
          if (isTransitioning || hasEntered) return;
          isInteracting = false;
          setPressing(false);
          stopWaterRipple();
          rTo(getRestRadius());
        };

        const handlePointerDown = (event: PointerEvent) => {
          if (isTransitioning || hasEntered) return;
          if (shouldIgnorePointer(event)) return;
          if (isMobilePerformance) {
            state.x = event.clientX;
            state.y = event.clientY;
            updateLens();
          }
          openLens({ x: event.clientX, y: event.clientY });
        };

        const handleKeyDown = (event: KeyboardEvent) => {
          if (isTransitioning || hasEntered) return;
          if (event.code === 'Space' && !event.repeat) {
            event.preventDefault();
            openLens();
          }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
          if (isTransitioning || hasEntered) return;
          if (event.code === 'Space') closeLens();
        };

        const resetLens = () => {
          if (isTransitioning || hasEntered) return;
          isInteracting = false;
          setPressing(false);
          stopWaterRipple();
          gsap.to(state, {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            radius: getRestRadius(),
            duration: reduceMotion ? 0.01 : 0.62,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerdown', handlePointerDown, { passive: true });
        window.addEventListener('pointerup', closeLens);
        window.addEventListener('pointercancel', closeLens);
        window.addEventListener('blur', closeLens);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('resize', resetLens);

        cleanupLensSystem = () => {
          isInteracting = false;
          gsap.ticker.remove(updateLens);
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerdown', handlePointerDown);
          window.removeEventListener('pointerup', closeLens);
          window.removeEventListener('pointercancel', closeLens);
          window.removeEventListener('blur', closeLens);
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          window.removeEventListener('resize', resetLens);
        };

        if (!reduceMotion) {
          const logoDuration = isMobilePerformance ? 0.86 : 1.25;
          const descriptionDuration = isMobilePerformance ? 0.8 : 1.2;
          gsap.timeline({ defaults: { ease: 'power4.out' } })
            .addLabel('intro', 0)
            .fromTo(container.querySelectorAll('.logo'), { y: 42, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: logoDuration }, 'intro+=0.14')
            .fromTo(container.querySelectorAll('.description'), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: descriptionDuration }, 'intro+=0.3');

          gsap.to(container.querySelectorAll('.roll-text'), {
            rotation: 360,
            duration: isMobilePerformance ? 14 : 10,
            repeat: -1,
            ease: 'none'
          });
        }

        return () => {
          cleanupLensSystem();
        };
      }
    );

    // Transition Logic
    let transitionRippleFrame: number | null = null;
    const transitionRippleState = {
      active: false,
      start: 0,
      cx: 0,
      cy: 0,
      width: 0,
      height: 0,
      dpr: 1,
      maxRadius: 0,
      seed: 1,
      compact: false,
      duration: 1180
    };

    const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
    const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp01(value), 3);
    const rippleRandom = (seed: number, a: number, b = 0) => {
      const value = Math.sin(seed * 12.9898 + a * 78.233 + b * 37.719) * 43758.5453;
      return value - Math.floor(value);
    };

    const clearRippleCanvas = () => {
      if (!rippleCanvas || !rippleContext) return;
      rippleContext.setTransform(1, 0, 0, 1, 0, 0);
      rippleContext.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
      rippleCanvas.style.opacity = '0';
    };

    const stopTransitionRippleCanvas = () => {
      if (transitionRippleFrame !== null) {
        window.cancelAnimationFrame(transitionRippleFrame);
        transitionRippleFrame = null;
      }
      transitionRippleState.active = false;
      clearRippleCanvas();
    };

    const resizeRippleCanvas = (width: number, height: number, compact: boolean) => {
      if (!rippleCanvas || !rippleContext) return false;
      const dprLimit = compact ? 0.75 : 1.2;
      const dprFloor = compact ? 0.65 : 0.75;
      const dpr = Math.max(dprFloor, Math.min(window.devicePixelRatio || 1, dprLimit));

      rippleCanvas.width = Math.ceil(width * dpr);
      rippleCanvas.height = Math.ceil(height * dpr);
      rippleCanvas.style.width = `${width}px`;
      rippleCanvas.style.height = `${height}px`;
      rippleCanvas.style.opacity = '1';
      rippleContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      rippleContext.clearRect(0, 0, width, height);
      transitionRippleState.dpr = dpr;
      return true;
    };

    const drawBrokenRippleRing = (ctx: CanvasRenderingContext2D, radius: number, alpha: number, lineWidth: number, ringIndex: number, elapsed: number) => {
      const { cx, cy, width, height, seed, compact } = transitionRippleState;
      const tau = Math.PI * 2;
      const segmentCount = Math.min(compact ? 32 : 72, Math.max(compact ? 16 : 22, Math.round(radius / (compact ? 15 : 8))));
      const step = tau / segmentCount;
      const drift = elapsed * 0.00012 * (ringIndex % 2 ? -1 : 1);
      const wobbleAmount = Math.min(7.5, 1.8 + radius * 0.009);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const distanceToEdge = Math.min(cx, width - cx, cy, height - cy);
      if (radius + lineWidth * 4 < distanceToEdge) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(78, 0, 8, ${(alpha * 0.34).toFixed(3)})`;
        ctx.lineWidth = lineWidth * 5.2;
        ctx.arc(cx, cy, radius + lineWidth * 1.6, 0, tau);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = `rgba(156, 14, 26, ${(alpha * 0.28).toFixed(3)})`;
        ctx.lineWidth = lineWidth * 2.4;
        ctx.arc(cx, cy, radius, 0, tau);
        ctx.stroke();
      }

      for (let i = 0; i < segmentCount; i++) {
        const skip = rippleRandom(seed + ringIndex, i, 1);
        if (skip < 0.1) continue;

        const arcNoise = rippleRandom(seed + ringIndex, i, 2);
        const start = i * step + drift + arcNoise * step * 0.24;
        const span = step * (0.58 + rippleRandom(seed + ringIndex, i, 3) * 0.62);
        const mid = start + span * 0.5;
        const wobble =
          Math.sin(mid * (3 + ringIndex * 0.7) + elapsed * 0.006 + seed) * wobbleAmount +
          Math.sin(mid * (8 + ringIndex) - elapsed * 0.003) * wobbleAmount * 0.34;
        const segmentRadius = Math.max(3, radius + wobble);
        const midX = cx + Math.cos(mid) * segmentRadius;
        const midY = cy + Math.sin(mid) * segmentRadius;
        const edgeDistance = Math.min(midX, width - midX, midY, height - midY);
        const edgeFade = clamp01(edgeDistance / 72);
        const segmentAlpha = alpha * edgeFade * (0.54 + rippleRandom(seed + ringIndex, i, 4) * 0.34);
        if (segmentAlpha <= 0.004) continue;
        const widthNoise = 0.78 + rippleRandom(seed + ringIndex, i, 5) * 0.54;
        const baseWidth = Math.max(0.7, lineWidth * widthNoise);

        if (!compact) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(70, 0, 8, ${(segmentAlpha * 0.56).toFixed(3)})`;
          ctx.lineWidth = baseWidth * 4.8;
          ctx.arc(cx, cy, segmentRadius + baseWidth * 0.95, start, start + span);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.strokeStyle = `rgba(165, 18, 30, ${(segmentAlpha * 0.82).toFixed(3)})`;
        ctx.lineWidth = baseWidth * 2.45;
        ctx.arc(cx, cy, segmentRadius, start + span * 0.04, start + span * 0.96);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 112, 104, ${(segmentAlpha * 0.46).toFixed(3)})`;
        ctx.lineWidth = Math.max(0.5, baseWidth * 0.82);
        ctx.arc(cx, cy, segmentRadius - baseWidth * 1.05, start + span * 0.15, start + span * 0.78);
        ctx.stroke();

        if (!compact && rippleRandom(seed + ringIndex, i, 6) > 0.62) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 170, 150, ${(segmentAlpha * 0.28).toFixed(3)})`;
          ctx.lineWidth = Math.max(0.42, baseWidth * 0.42);
          ctx.arc(cx, cy, segmentRadius - baseWidth * 1.85, start + span * 0.24, start + span * 0.56);
          ctx.stroke();
        }
      }
    };

    const drawRippleImpact = (ctx: CanvasRenderingContext2D, elapsed: number) => {
      const { cx, cy } = transitionRippleState;
      const impactProgress = clamp01(elapsed / 120);
      const alpha = 0.58 * (1 - impactProgress);
      if (alpha <= 0.01) return;

      const radius = 4 + impactProgress * 18;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(255, 130, 118, ${(alpha * 0.9).toFixed(3)})`);
      gradient.addColorStop(0.38, `rgba(180, 22, 32, ${(alpha * 0.55).toFixed(3)})`);
      gradient.addColorStop(1, 'rgba(180, 22, 32, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 128, 112, ${(alpha * 0.42).toFixed(3)})`;
      ctx.lineWidth = 1.4 + impactProgress * 2.8;
      ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawTransitionRippleFrame = (now: number) => {
      if (!transitionRippleState.active || !rippleContext) return;

      const { start, width, height, cx, cy, maxRadius, compact, duration } = transitionRippleState;
      const elapsed = now - start;
      const progress = clamp01(elapsed / duration);
      const waveProgress = easeOutCubic(clamp01((elapsed - 90) / (duration - 190)));
      const ctx = rippleContext;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const centerAlpha = Math.max(0, 0.18 * (1 - clamp01(elapsed / 620)));
      if (centerAlpha > 0.004) {
        const centerGradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.min(170, maxRadius * 0.22));
        centerGradient.addColorStop(0, `rgba(135, 8, 12, ${(centerAlpha * 0.26).toFixed(3)})`);
        centerGradient.addColorStop(0.5, `rgba(118, 0, 0, ${(centerAlpha * 0.16).toFixed(3)})`);
        centerGradient.addColorStop(1, 'rgba(118, 0, 0, 0)');
        ctx.fillStyle = centerGradient;
        ctx.fillRect(0, 0, width, height);
      }

      drawRippleImpact(ctx, elapsed);

      const innerFade = Math.max(0, 1 - elapsed / 720);
      if (innerFade > 0.01) {
        const innerCount = compact ? 3 : 6;
        const innerGap = compact ? 13 : 12;

        for (let i = 0; i < innerCount; i++) {
          const radius = 9 + i * innerGap + elapsed * 0.045;
          const alpha = 0.16 * (1 - i / (innerCount + 1)) * innerFade;
          const lineWidth = Math.max(0.62, (compact ? 1.05 : 1.3) * (1 - i * 0.07));
          drawBrokenRippleRing(ctx, radius, alpha, lineWidth, i + 30, elapsed * 1.13);
        }
      }

      const frontRadius = 10 + maxRadius * waveProgress;
      const ringCount = compact ? 6 : 13;
      const ringGap = compact ? 18 : 15;
      const fade = Math.pow(1 - progress, 0.58);

      for (let i = 0; i < ringCount; i++) {
        const radius = frontRadius - i * ringGap;
        if (radius < 8) continue;

        const centerBoost = i / Math.max(1, ringCount - 1);
        const ageFade = Math.max(0, 1 - (radius / (maxRadius + ringGap)));
        const alpha = (0.16 + centerBoost * 0.22 + ageFade * 0.16) * fade;
        const lineWidth = Math.max(0.66, (compact ? 1.24 : 1.72) * (1 - progress * 0.4) * (1 - i * 0.025));

        drawBrokenRippleRing(ctx, radius, alpha, lineWidth, i, elapsed);
      }

      ctx.globalCompositeOperation = 'source-over';

      if (elapsed < duration) {
        transitionRippleFrame = window.requestAnimationFrame(drawTransitionRippleFrame);
      } else {
        stopTransitionRippleCanvas();
      }
    };

    const startTransitionRippleCanvas = (cx: number, cy: number, width: number, height: number, maxRadius: number) => {
      stopTransitionRippleCanvas();
      if (!rippleCanvas || !rippleContext) return;

      const compact = width <= 760 || height <= 560 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!resizeRippleCanvas(width, height, compact)) return;

      transitionRippleState.active = true;
      transitionRippleState.start = performance.now();
      transitionRippleState.cx = cx;
      transitionRippleState.cy = cy;
      transitionRippleState.width = width;
      transitionRippleState.height = height;
      transitionRippleState.maxRadius = Math.max(180, maxRadius * (compact ? 0.62 : 0.72));
      transitionRippleState.seed = (Math.floor(transitionRippleState.start) % 997) + 1;
      transitionRippleState.compact = compact;
      transitionRippleState.duration = compact ? 840 : 1180;

      drawTransitionRippleFrame(transitionRippleState.start);
      transitionRippleFrame = window.requestAnimationFrame(drawTransitionRippleFrame);
    };

    const finalizeEnterTransition = (killTimeline = true) => {
      if (hasEntered) return;

      hasEntered = true;
      isTransitioning = false;

      if (transitionFinalizeTimer !== null) {
        window.clearTimeout(transitionFinalizeTimer);
        transitionFinalizeTimer = null;
      }

      if (killTimeline && transitionTimeline) {
        transitionTimeline.kill();
      }
      transitionTimeline = null;

      container.classList.remove('is-transitioning', 'is-water-active', 'is-pressing');
      container.classList.add('entered', 'intro-complete');

      gsap.set(container, { backgroundColor: '#050505' });
      gsap.set(container.querySelectorAll('.bg-layer, .edge-distortion-layer, .fg-layer, .glass-rim, .bottom-icon, .ui-layer'), {
        autoAlpha: 0,
        display: 'none',
        pointerEvents: 'none'
      });
      gsap.set(waveRed, { autoAlpha: 0, display: 'none', pointerEvents: 'none' });
      stopTransitionRippleCanvas();
      gsap.set(waveBlack, { autoAlpha: 0, display: 'none', pointerEvents: 'none' });
      waterDisplacement?.setAttribute('scale', '0');
      
      onCompleteRef.current();
    };

    const startEnterTransition = (e: Event) => {
      if (isTransitioning || hasEntered) return;
      e.stopPropagation();
      e.preventDefault();

      isTransitioning = true;
      enterButtons.forEach((button) => {
        button.style.pointerEvents = 'none';
      });
      container.classList.add('is-transitioning');

      if (transitionTimeline) {
        transitionTimeline.kill();
        transitionTimeline = null;
      }
      if (transitionFinalizeTimer !== null) {
        window.clearTimeout(transitionFinalizeTimer);
        transitionFinalizeTimer = null;
      }

      cleanupLensSystem();
      if (waterIntervalId !== null) {
        window.clearInterval(waterIntervalId);
        waterIntervalId = null;
      }

      isInteracting = false;
      state.water = 0;
      setPressing(false);
      setWaterActive(false);
      waterDisplacement?.setAttribute('scale', '0');

      gsap.killTweensOf(state);
      gsap.killTweensOf(glassRim);
      gsap.killTweensOf(fgLayer);
      gsap.killTweensOf(edgeLayer);
      gsap.killTweensOf(bgLayer);
      gsap.killTweensOf(container.querySelectorAll('.bottom-icon'));
      gsap.killTweensOf(waveRed);
      gsap.killTweensOf(waveBlack);
      gsap.killTweensOf(rippleCanvas);
      gsap.killTweensOf(container.querySelectorAll('.logo'));
      gsap.killTweensOf(container.querySelectorAll('.description'));
      gsap.killTweensOf(container.querySelectorAll('.roll-text'));
      gsap.killTweensOf(container.querySelectorAll('.dot'));

      const clickedButton = (e.currentTarget as HTMLElement) || enterButtons[0];
      const rect = clickedButton.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const maxRippleRadius = Math.ceil(
        Math.hypot(
          Math.max(cx, viewportWidth - cx),
          Math.max(cy, viewportHeight - cy)
        ) + Math.max(96, Math.min(viewportWidth, viewportHeight) * 0.12)
      );

      gsap.set(waveRed, {
        display: 'block',
        visibility: 'visible',
        opacity: 1,
        position: 'absolute',
        inset: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        x: 0,
        y: 0,
        scale: 1,
        borderRadius: 0,
        transformOrigin: '50% 50%',
        zIndex: 2147483000
      });
      gsap.set(waveBlack, {
        display: 'block',
        visibility: 'visible',
        opacity: 0,
        position: 'absolute',
        inset: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        x: 0,
        y: 0,
        scale: 1,
        borderRadius: 0,
        transformOrigin: '50% 50%',
        zIndex: 2147483001
      });
      gsap.set(container.querySelectorAll('.transition-wave'), { pointerEvents: 'none' });
      startTransitionRippleCanvas(cx, cy, viewportWidth, viewportHeight, maxRippleRadius);

      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          finalizeEnterTransition(false);
        }
      });
      transitionTimeline = tl;
      transitionFinalizeTimer = window.setTimeout(() => finalizeEnterTransition(true), 1800);

      tl.to(container.querySelectorAll('.logo, .description, .roll-text, .dot, #glass-rim, #edge-layer, #fg-layer, .bg-layer'), {
        opacity: 0,
        duration: 0.14,
        ease: 'power2.inOut'
      }, 0);

      tl.to(container, { '--glow-red': 'rgba(120, 0, 0, 0.22)', duration: 0.14 }, 0);

      if (rippleCanvas) {
        tl.to(rippleCanvas, { opacity: 0, duration: 0.22, ease: 'sine.in' }, 1.08);
      }
      tl.to(waveBlack, { opacity: 1, duration: 0.3, ease: 'power2.inOut' }, 1.08);
      tl.to(waveRed, { opacity: 0, duration: 0.24, ease: 'sine.in' }, 1.16);

      tl.set(container, { backgroundColor: '#050505' }, 1.38);
    };

    if (enterButtons.length) {
      enterButtons.forEach((button) => {
        button.addEventListener('click', startEnterTransition);
      });
    }

    return () => {
      if (transitionFinalizeTimer !== null) window.clearTimeout(transitionFinalizeTimer);
      if (waterIntervalId !== null) window.clearInterval(waterIntervalId);
      cleanupLensSystem();
      stopTransitionRippleCanvas();
      if (transitionTimeline) {
        transitionTimeline.kill();
      }
      mm.revert(); // clean up GSAP matchMedia
      enterButtons.forEach((button) => {
        button.removeEventListener('click', startEnterTransition);
      });
    };
  }, []);

  return (
    <div className="intro-container" ref={containerRef}>
      <div className="layer bg-layer">
        <div className="content-wrapper">
          <div className="content">
            <h1 className="logo">TPY / AI ART LAB</h1>
            <p className="description">REBUILDING SYSTEM</p>
          </div>
          <div className="bottom-icon">
            <div className="roll-text bg-roll-text">ENTER SYSTEM • </div>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="intro-edge-warp" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves={1} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feMerge>
              <feMergeNode in="displaced" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="intro-water-ripple" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence id="intro-water-noise" type="turbulence" baseFrequency="0.012 0.046" numOctaves={2} seed="7" result="waterNoise" />
            <feDisplacementMap id="intro-water-displacement" in="SourceGraphic" in2="waterNoise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="layer edge-distortion-layer" id="edge-layer">
        <div className="content-wrapper bg-content-clone">
          <div className="content">
            <h1 className="logo">TPY / AI ART LAB</h1>
            <p className="description">REBUILDING SYSTEM</p>
          </div>
          <div className="bottom-icon">
            <div className="roll-text bg-roll-text-clone">ENTER SYSTEM • </div>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      <div className="layer fg-layer" id="fg-layer">
        <div className="content-wrapper fg-wrapper">
          <div className="content">
            <h1 className="logo">TPY / AI ART LAB</h1>
            <p className="description">REBUILDING SYSTEM</p>
          </div>
          <div className="bottom-icon">
            <div className="roll-text fg-roll-text">ENTER SYSTEM • </div>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      <div className="glass-rim" id="glass-rim"></div>

      <div className="ui-layer" id="ui-layer">
        <div className="top-right-controls" style={{ display: 'none' }}>
          <button className="icon-btn" id="reset-btn" aria-label="Reset lens">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="transition-wave wave-red">
        <canvas className="transition-ripple-canvas" id="transition-ripple-canvas" aria-hidden="true"></canvas>
      </div>
      <div className="transition-wave wave-black"></div>
    </div>
  );
}
