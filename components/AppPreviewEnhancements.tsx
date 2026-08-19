'use client';

import { useEffect } from 'react';

function getBackgroundImage(el: HTMLElement | null): string | null {
  if (!el) return null;
  const inline = el.style.backgroundImage;
  if (inline && inline !== 'none') return inline;
  const computed = window.getComputedStyle(el).backgroundImage;
  return computed && computed !== 'none' ? computed : null;
}

export function AppPreviewEnhancements() {
  useEffect(() => {
    if (window.location.pathname !== '/club-app') return;

    const hero = document.querySelector<HTMLElement>('.hero');
    const dots = Array.from(document.querySelectorAll<HTMLElement>('.hero-dot'));
    if (!hero || dots.length === 0) return;

    const imageCandidates = [
      getBackgroundImage(hero),
      ...Array.from(document.querySelectorAll<HTMLElement>('.event-photo')).map(getBackgroundImage),
    ].filter((value): value is string => Boolean(value));

    const images = Array.from(new Set(imageCandidates)).slice(0, dots.length);
    if (images.length < 2) return;

    let activeIndex = 0;
    let touchStartX: number | null = null;

    const show = (index: number) => {
      const safeIndex = ((index % images.length) + images.length) % images.length;
      activeIndex = safeIndex;
      hero.style.backgroundImage = images[safeIndex];
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === safeIndex);
        dot.setAttribute('aria-current', i === safeIndex ? 'true' : 'false');
      });
    };

    const cleanups: Array<() => void> = [];

    dots.forEach((dot, index) => {
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', `Show club photo ${index + 1}`);
      dot.style.cursor = 'pointer';

      const activate = () => {
        if (index < images.length) show(index);
      };
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      };

      dot.addEventListener('click', activate);
      dot.addEventListener('keydown', onKey);
      cleanups.push(() => dot.removeEventListener('click', activate));
      cleanups.push(() => dot.removeEventListener('keydown', onKey));
    });

    const onTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (touchStartX == null) return;
      const endX = event.changedTouches[0]?.clientX ?? touchStartX;
      const delta = endX - touchStartX;
      touchStartX = null;
      if (Math.abs(delta) < 45) return;
      show(activeIndex + (delta < 0 ? 1 : -1));
    };

    hero.addEventListener('touchstart', onTouchStart, { passive: true });
    hero.addEventListener('touchend', onTouchEnd, { passive: true });
    cleanups.push(() => hero.removeEventListener('touchstart', onTouchStart));
    cleanups.push(() => hero.removeEventListener('touchend', onTouchEnd));

    show(0);

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
