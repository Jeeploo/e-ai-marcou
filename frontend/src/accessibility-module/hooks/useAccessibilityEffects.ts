import { useEffect } from 'react';
import type { A11yPreferences } from '../store/useAccessibilityStore';

/** Efeitos globais limitados às classes do módulo e ao conteúdo identificado. */
export function useAccessibilityEffects(preferences: A11yPreferences) {
  useEffect(() => {
    const html = document.documentElement;
    const beforeClass = new Map<string, boolean>();
    const beforeStyle = new Map<string, [string, string]>();
    const toggle = (name: string, active: boolean) => {
      beforeClass.set(name, html.classList.contains(name));
      html.classList.toggle(name, active);
    };
    const variable = (name: string, value: string) => {
      beforeStyle.set(name, [html.style.getPropertyValue(name), html.style.getPropertyPriority(name)]);
      html.style.setProperty(name, value);
    };
    const classes: Record<string, boolean> = {
      'a11y-dyslexia': preferences.dyslexiaFont,
      'a11y-legible': preferences.legibleFont,
      'a11y-reading-mode': preferences.readingMode,
      'a11y-hide-images': preferences.hideImages,
      'a11y-highlight-titles': preferences.highlightTitles,
      'a11y-highlight-links': preferences.highlightLinks,
      'a11y-highlight-buttons': preferences.highlightButtons,
      'a11y-reduce-motion': preferences.reduceMotion,
      'a11y-pause-animations': preferences.pauseAnimations,
      'a11y-keyboard-tips': preferences.keyboardTips,
      'a11y-hover-focus': preferences.hoverFocus,
      'a11y-color-support': ['protanopia', 'deuteranopia', 'tritanopia'].includes(preferences.daltonism),
      'a11y-text-active': preferences.lineHeight > 0 || preferences.letterSpacing > 0 || preferences.wordSpacing > 0,
      'a11y-custom-cursor': preferences.cursorSize !== 'default' || preferences.cursorColor !== 'default',
      'a11y-text-align': preferences.textAlign !== 'default',
    };
    Object.entries(classes).forEach(([name, active]) => toggle(name, active));
    variable('--a11y-page-scale', String(preferences.pageScale / 100));
    variable('--a11y-line-height', String(1.5 + preferences.lineHeight * 0.1));
    variable('--a11y-letter-spacing', `${preferences.letterSpacing}px`);
    variable('--a11y-word-spacing', `${preferences.wordSpacing}px`);
    variable('--a11y-text-align', preferences.textAlign === 'default' ? 'inherit' : preferences.textAlign);
    const filter = [
      preferences.highContrast > 0 ? `contrast(${100 + preferences.highContrast}%)` : '',
      preferences.invertColors ? 'invert(1) hue-rotate(180deg)' : '',
      preferences.daltonism === 'monochromatic' ? 'grayscale(1)' : '',
      preferences.saturation !== 100 ? `saturate(${preferences.saturation}%)` : '',
      preferences.brightness !== 100 ? `brightness(${preferences.brightness}%)` : '',
    ].filter(Boolean).join(' ');
    variable('--a11y-filter', filter || 'none');
    let cursor = 'auto';
    if (preferences.cursorSize !== 'default' || preferences.cursorColor !== 'default') {
      const size = preferences.cursorSize === 'large' ? 48 : preferences.cursorSize === 'medium' ? 36 : 28;
      const fill = preferences.cursorColor === 'white' ? 'white' : preferences.cursorColor === 'yellow' ? '#FDE047' : 'black';
      const stroke = fill === 'black' ? 'white' : 'black';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4.7z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;
      cursor = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 2, auto`;
    }
    variable('--a11y-cursor', cursor);
    return () => {
      beforeClass.forEach((active, name) => html.classList.toggle(name, active));
      beforeStyle.forEach(([value, priority], name) => value
        ? html.style.setProperty(name, value, priority) : html.style.removeProperty(name));
    };
  }, [preferences]);

  useEffect(() => {
    if (preferences.textSize === 100) return;
    // Mede toda a tipografia antes de aplicar qualquer alteração: evita rem
    // multiplicado em cascata e contempla fontes em px sem alterar o HTML.
    const originals = new Map<HTMLElement, [string, string]>();
    let frame = 0;
    const restore = () => originals.forEach(([value, priority], element) => value
      ? element.style.setProperty('font-size', value, priority) : element.style.removeProperty('font-size'));
    const resizeText = () => {
      restore();
      const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-a11y-content], [data-a11y-content] *'))
        .filter(element => !element.closest('[data-a11y-ignore], script, style, svg, canvas, iframe') && (
          /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(element.tagName) ||
          Array.from(element.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
        ));
      const measurements = elements.map(element => {
        if (!originals.has(element)) originals.set(element, [element.style.getPropertyValue('font-size'), element.style.getPropertyPriority('font-size')]);
        return [element, parseFloat(getComputedStyle(element).fontSize)] as const;
      });
      measurements.forEach(([element, size]) => {
        if (Number.isFinite(size)) element.style.setProperty('font-size', `${size * preferences.textSize / 100}px`, 'important');
      });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(resizeText); };
    resizeText();
    const observer = new MutationObserver(schedule);
    // childList cobre conteúdo montado por navegação/React; atributos de estilo
    // escritos acima não acionam o observador e não criam um ciclo.
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', schedule); restore(); };
  }, [preferences.textSize]);

  useEffect(() => {
    if (!preferences.muteMedia) return;
    const original = new Map<HTMLMediaElement, boolean>();
    const mute = () => document.querySelectorAll<HTMLMediaElement>('[data-a11y-content] video, [data-a11y-content] audio').forEach(element => {
      if (!original.has(element)) original.set(element, element.muted);
      element.muted = true;
    });
    mute();
    const observer = new MutationObserver(mute);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); original.forEach((muted, element) => { element.muted = muted; }); };
  }, [preferences.muteMedia]);
}
