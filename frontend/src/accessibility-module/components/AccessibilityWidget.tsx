'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { type A11yPreferences, DEFAULT_STORAGE_KEY, startAccessibilityPersistence, useAccessibilityStore } from '../store/useAccessibilityStore';
import { useAccessibilityEffects } from '../hooks/useAccessibilityEffects';
import { 
  X, ChevronRight, ArrowLeft, Eye, Type, Keyboard, 
  Volume2, Focus, RotateCcw, ShieldCheck, BrainCircuit,
  ZoomIn, Ear, BookOpen, Globe
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const subscribeToClientMount = () => () => undefined;

const UniversalAccessIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 8.5v5" />
    <path d="M12 9.5l-3.5-1" />
    <path d="M12 9.5l3.5-1" />
    <path d="M12 13.5l-2.5 4" />
    <path d="M12 13.5l2.5 4" />
    <circle cx="12" cy="2.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="21.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="2.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="21.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const NavRow = ({ icon: Icon, title, onClick }: { icon: LucideIcon; title: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} aria-label={`Abrir menu de ${title}`} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 mb-2 rounded-xl transition-colors hover:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-sm">
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-emerald-800" aria-hidden="true" />
      <span className="font-semibold text-[15px] text-slate-800">{title}</span>
    </div>
    <ChevronRight size={18} className="text-slate-400" aria-hidden="true" />
  </button>
);

const ProfileCard = ({ icon: Icon, title, desc, onClick, active }: { icon: LucideIcon; title: string; desc: string; onClick: () => void; active: boolean }) => (
  <button type="button" 
    onClick={onClick} 
    aria-pressed={active}
    className={`flex flex-col p-4 rounded-xl border text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all ${active ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
  >
    <div className="flex items-center gap-2 mb-2">
      <Icon size={18} className={active ? 'text-emerald-700' : 'text-slate-700'} aria-hidden="true" />
      <h4 className={`font-bold text-[14px] ${active ? 'text-emerald-900' : 'text-slate-800'}`}>{title}</h4>
    </div>
    <p className="text-[13px] text-slate-600 leading-relaxed">{desc}</p>
  </button>
);

const RangeSliderRow = ({ label, value, min, max, step, unit = "%", onChange }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (value: number) => void }) => {
  const labelId = useId();
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="py-3 border-b border-slate-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[14px] font-medium text-slate-800" id={labelId}>{label}</span>
        <span className="text-[13px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100" aria-live="polite" aria-atomic="true">
          {value}{unit}
        </span>
      </div>
      <input 
        type="range" 
        min={min} max={max} step={step}
        aria-labelledby={labelId}
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-700 a11y-custom-slider"
        style={{ background: `linear-gradient(to right, #047857 0%, #047857 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)` }}
      />
    </div>
  );
};

const SelectGroup = ({ label, options, currentValue, onChange }: { label: string; options: { label: string; value: string }[]; currentValue: string; onChange: (value: string) => void }) => {
  const name = useId();
  return <fieldset className="py-4 border-b border-slate-100">
    <legend className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => <label key={opt.value} className="relative cursor-pointer">
        <input type="radio" name={name} value={opt.value} checked={currentValue === opt.value}
          onChange={() => onChange(opt.value)} className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
        <span className={`flex min-h-11 items-center px-3 py-2 rounded-lg text-[13px] font-semibold border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-700 ${currentValue === opt.value ? 'bg-emerald-800 border-emerald-900 text-white shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>{opt.label}</span>
      </label>)}
    </div>
  </fieldset>;
};

const ToggleSwitch = ({ label, description, active, onChange }: { label: string; description?: string; active: boolean; onChange: (value: boolean) => void }) => {
  const id = useId();
  return <div className="py-3 border-b border-slate-100 last:border-0">
    <label className="relative flex min-h-11 items-center justify-between cursor-pointer gap-3">
      <span className="text-[14px] font-medium text-slate-800">{label}</span>
      <input type="checkbox" role="switch" checked={active} onChange={event => onChange(event.target.checked)}
        aria-describedby={description ? id : undefined} className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
      <span aria-hidden="true" className={`relative flex items-center h-6 w-11 rounded-full shrink-0 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-700 ${active ? 'bg-emerald-700' : 'bg-slate-300'}`}>
        <span className={`w-4 h-4 rounded-full bg-white shadow-sm ${active ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </label>
    {description && <p id={id} className="text-[13px] text-slate-600 mt-2 leading-relaxed">{description}</p>}
  </div>;
};

export interface AccessibilityWidgetProps {
  /** false desativa persistência; uma chave própria evita conflito entre apps. */
  storageKey?: string | false;
  title?: string;
}

export default function AccessibilityWidget({ storageKey = DEFAULT_STORAGE_KEY, title = 'Painel de Preferências' }: AccessibilityWidgetProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<'main'|'visual'|'text'|'nav'|'audio'|'focus'>('main');
  const isMounted = useSyncExternalStore(subscribeToClientMount, () => true, () => false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  
  const currentTextRef = useRef(''); 
  const store = useAccessibilityStore();
  const [statusMessage, setStatusMessage] = useState('');
  const selectionRef = useRef('');
  const highlightRef = useRef<HTMLElement | null>(null);
  
  type PositionKey = 'top-left' | 'center-left' | 'bottom-left' | 'top-right' | 'center-right' | 'bottom-right';
  const pos = store.widgetPosition as PositionKey;
  const isLeft = pos.includes('left');

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDialogElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const mainMenuRef = useRef<HTMLDivElement>(null);

  useAccessibilityEffects(store);
  useEffect(() => startAccessibilityPersistence(storageKey), [storageKey]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (isOpen && !panel.open) { panel.showModal(); closeBtnRef.current?.focus(); }
    if (!isOpen && panel.open) { panel.close(); triggerRef.current?.focus(); }
    return () => { if (panel.open) panel.close(); };
  }, [isOpen, isMounted]);

  useEffect(() => {
    if (!isOpen) return;
    if (currentMenu !== 'main') backBtnRef.current?.focus();
    else mainMenuRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, [currentMenu, isOpen]);

  useEffect(() => {
    const capture = () => {
      const text = window.getSelection()?.toString().trim();
      if (text) selectionRef.current = text;
    };
    document.addEventListener('selectionchange', capture);
    return () => document.removeEventListener('selectionchange', capture);
  }, []);

  const canSpeak = () => typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
  const clearHighlight = () => { highlightRef.current?.classList.remove('a11y-reading-highlight'); highlightRef.current = null; };
  const handleStop = () => { if (canSpeak()) window.speechSynthesis.cancel(); clearHighlight(); };
  const speakText = (text: string, rate: number) => {
    if (!canSpeak()) { setStatusMessage('Leitura em voz alta indisponível neste navegador.'); return; }
    handleStop();
    if (!text.trim()) { setStatusMessage('Nenhum texto disponível para leitura.'); return; }
    currentTextRef.current = text;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; utterance.rate = rate / 100;
    utterance.onend = clearHighlight;
    utterance.onerror = () => { clearHighlight(); setStatusMessage('Não foi possível reproduzir a leitura.'); };
    window.speechSynthesis.speak(utterance);
  };
  const handleReadSelected = () => {
    const text = window.getSelection()?.toString().trim() || selectionRef.current;
    if (text) speakText(text, store.ttsSpeed);
    else setStatusMessage('Selecione um texto no conteúdo da página primeiro.');
  };
  const handleReadPage = () => {
    const root = document.querySelector('[data-a11y-content]');
    if (!root) { setStatusMessage('Área de conteúdo não encontrada. Confira a integração.'); return; }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const parts: string[] = [];
    while (walker.nextNode()) {
      const parent = walker.currentNode.parentElement;
      if (!parent || parent.closest('script, style, noscript, svg, [hidden], [inert], [aria-hidden="true"], [data-a11y-ignore]')) continue;
      const style = getComputedStyle(parent);
      if (style.display !== 'none' && style.visibility !== 'hidden' && parent.getClientRects().length) parts.push(walker.currentNode.textContent || '');
    }
    speakText(parts.join(' ').replace(/\s+/g, ' ').trim(), store.ttsSpeed);
  };
  const handlePauseResume = () => {
    if (!canSpeak()) { setStatusMessage('Leitura em voz alta indisponível neste navegador.'); return; }
    if (window.speechSynthesis.paused) window.speechSynthesis.resume(); else window.speechSynthesis.pause();
  };
  const changeSpeed = (newSpeed: number) => {
    store.updateValue('ttsSpeed', newSpeed);
    if (canSpeak() && window.speechSynthesis.speaking && !window.speechSynthesis.paused) speakText(currentTextRef.current, newSpeed);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => { setMouseX(event.clientX); setMouseY(event.clientY); };
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || event.target.closest('a,button,input,select,textarea,[role="button"],[contenteditable="true"],#a11y-widget-root,#a11y-panel')) return;
      const target = event.target.closest<HTMLElement>('[data-a11y-content] *');
      if (!target) return;
      const text = target.innerText || target.getAttribute('aria-label') || target.getAttribute('alt');
      if (text?.trim()) {
        speakText(text, store.ttsSpeed);
        if (canSpeak()) { highlightRef.current = target; target.classList.add('a11y-reading-highlight'); }
      }
    };
    if (store.readingGuide !== 'none') document.addEventListener('mousemove', handleMouseMove);
    if (store.ttsEnabled) document.addEventListener('click', handleClick);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('click', handleClick); };
    // O efeito depende somente das preferências de leitura usadas pelos handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.readingGuide, store.ttsEnabled, store.ttsSpeed]);

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    highlightRef.current?.classList.remove('a11y-reading-highlight');
  }, []);

  useEffect(() => {
    if (!store.ttsEnabled) {
      window.speechSynthesis?.cancel();
      highlightRef.current?.classList.remove('a11y-reading-highlight');
      highlightRef.current = null;
    }
  }, [store.ttsEnabled]);

  if (!isMounted) return null;

  const positionClasses = {
    trigger: {
      'top-left': 'top-10 left-0 rounded-r-xl',
      'center-left': 'top-1/2 -translate-y-1/2 left-0 rounded-r-xl',
      'bottom-left': 'bottom-10 left-0 rounded-r-xl',
      'top-right': 'top-10 right-0 rounded-l-xl',
      'center-right': 'top-1/2 -translate-y-1/2 right-0 rounded-l-xl',
      'bottom-right': 'bottom-10 right-0 rounded-l-xl',
    },
    panel: {
      'top-left': 'top-10 left-4 sm:left-6',
      'center-left': 'top-1/2 -translate-y-1/2 left-4 sm:left-6',
      'bottom-left': 'bottom-10 left-4 sm:left-6',
      'top-right': 'top-10 right-4 sm:right-6',
      'center-right': 'top-1/2 -translate-y-1/2 right-4 sm:right-6',
      'bottom-right': 'bottom-10 right-4 sm:right-6',
    },
    triggerOpen: {
      'top-left': '-translate-x-14 opacity-0',
      'center-left': '-translate-x-14 opacity-0',
      'bottom-left': '-translate-x-14 opacity-0',
      'top-right': 'translate-x-14 opacity-0',
      'center-right': 'translate-x-14 opacity-0',
      'bottom-right': 'translate-x-14 opacity-0',
    },
    panelClosed: {
      'top-left': '-translate-x-[120%] opacity-0 pointer-events-none',
      'center-left': '-translate-x-[120%] opacity-0 pointer-events-none',
      'bottom-left': '-translate-x-[120%] opacity-0 pointer-events-none',
      'top-right': 'translate-x-[120%] opacity-0 pointer-events-none',
      'center-right': 'translate-x-[120%] opacity-0 pointer-events-none',
      'bottom-right': 'translate-x-[120%] opacity-0 pointer-events-none',
    },
    contentSlideOut: {
      'left': '-translate-x-full',
      'right': 'translate-x-full',
    }
  };

  return (
    <>
      {store.readingGuide === 'line' && (
        <div className="fixed pointer-events-none z-[9998] flex justify-center" style={{ top: mouseY + 20, left: mouseX, transform: 'translateX(-50%)', width: '600px' }} aria-hidden="true">
          <div className="relative w-full h-[6px] bg-black border-[1.5px] border-yellow-400">
            <div className="absolute left-1/2 -top-[12px] -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-yellow-400">
              <div className="absolute -left-[7px] top-[3px] w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-black"></div>
            </div>
          </div>
        </div>
      )}

      {store.readingGuide === 'mask' && (
        <>
          <div className="fixed top-0 left-0 w-full bg-black/60 z-[9998] pointer-events-none transition-transform duration-75" style={{ height: Math.max(0, mouseY - 50) }} />
          <div className="fixed bottom-0 left-0 w-full bg-black/60 z-[9998] pointer-events-none transition-transform duration-75" style={{ top: mouseY + 50, height: '100vh' }} />
        </>
      )}

      {store.readingGuide === 'spotlight' && (
        <div className="fixed inset-0 z-[9998] pointer-events-none transition-transform duration-75" style={{ background: `radial-gradient(circle 160px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.8) 100%)` }} aria-hidden="true" />
      )}

      <div id="a11y-widget-root" className="fixed top-0 left-0 w-full h-full z-[99998] pointer-events-none" aria-label="Camada de Acessibilidade">
        
        <button type="button"
          ref={triggerRef}
          onClick={() => { setIsOpen(!isOpen); if (!isOpen) setCurrentMenu('main'); }}
          aria-expanded={isOpen} aria-haspopup="dialog" aria-controls="a11y-panel"
          aria-label="Menu de ferramentas de acessibilidade"
          className={`pointer-events-auto absolute w-14 h-16 bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/50 
            ${positionClasses.trigger[pos]}
            ${isOpen ? positionClasses.triggerOpen[pos] : 'translate-x-0 opacity-100'}`}
        >
          <UniversalAccessIcon size={34} />
        </button>

        <dialog
          id="a11y-panel" ref={panelRef} aria-modal="true" aria-label="Painel de Controle de Acessibilidade"
          onCancel={event => { event.preventDefault(); setIsOpen(false); }}
          onKeyDown={event => {
            if (event.key !== 'Tab') return;
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select,textarea,[tabindex="0"]'))
              .filter(element => !element.closest('[inert],[hidden]') && element.getClientRects().length > 0);
            const first = items[0], last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }}
          className={`pointer-events-auto fixed w-[min(340px,calc(100vw-2rem))] sm:w-[380px] bg-white border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col max-h-[85dvh] rounded-2xl overflow-hidden transition-transform duration-300 ease-out 
          ${positionClasses.panel[pos]}
          ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          
          <div className="bg-emerald-800 p-5 flex justify-between items-center text-white shrink-0">
            <div>
              <h2 className="font-bold text-[16px] flex items-center gap-2"><UniversalAccessIcon size={20} /> Acessibilidade</h2>
              <p className="text-[12px] text-emerald-200 mt-1 font-medium">{title}</p>
            </div>
            <button type="button" 
              ref={closeBtnRef} onClick={() => setIsOpen(false)} aria-label="Fechar painel" 
              className="p-2 hover:bg-emerald-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex-1 min-h-0 overflow-hidden bg-white">
            
            <div ref={mainMenuRef} inert={currentMenu !== 'main'} aria-hidden={currentMenu !== 'main'} className={`absolute inset-0 w-full h-full overflow-y-auto a11y-no-scrollbar p-5 transition-transform duration-300 ease-in-out ${currentMenu === 'main' ? 'translate-x-0' : positionClasses.contentSlideOut[isLeft ? 'left' : 'right']}`}>
              
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Ajustes Personalizados</h3>
              <div className="space-y-1 mb-8">
                <NavRow icon={Eye} title="Configurações Visuais" onClick={() => setCurrentMenu('visual')} />
                <NavRow icon={Type} title="Texto e Leitura" onClick={() => setCurrentMenu('text')} />
                <NavRow icon={Keyboard} title="Navegação e Foco" onClick={() => setCurrentMenu('nav')} />
                <NavRow icon={Volume2} title="Áudio e Narração (TTS)" onClick={() => setCurrentMenu('audio')} />
                <NavRow icon={Focus} title="Foco e Animações" onClick={() => setCurrentMenu('focus')} />
              </div>

              <div className="mb-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Perfis de Acessibilidade</h3>
                <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">Ative perfis para aplicar configurações recomendadas de uma vez.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-4">
                <ProfileCard icon={Eye} title="Deficiência visual" desc="Contraste elevado, texto maior e cursor ampliado." active={store.activeProfiles.includes('visual_impairment')} onClick={() => store.toggleProfile('visual_impairment')} />
                <ProfileCard icon={ZoomIn} title="Baixa visão" desc="Aumento de texto e contraste focados em legibilidade." active={store.activeProfiles.includes('low_vision')} onClick={() => store.toggleProfile('low_vision')} />
                <ProfileCard icon={Ear} title="Cego / leitor de tela" desc="Atalhos para leitura em voz alta e destaques. Complementa o leitor de tela." active={store.activeProfiles.includes('blind')} onClick={() => store.toggleProfile('blind')} />
                <ProfileCard icon={Keyboard} title="Deficiência motora" desc="Navegação por teclado, cursor ampliado e animações pausadas." active={store.activeProfiles.includes('motor')} onClick={() => store.toggleProfile('motor')} />
                <ProfileCard icon={BookOpen} title="Dislexia" desc="Fonte amigável, alinhamento à esquerda e espaçamento." active={store.activeProfiles.includes('dyslexia')} onClick={() => store.toggleProfile('dyslexia')} />
                <ProfileCard icon={BrainCircuit} title="Cognitivo" desc="Reduz distrações e ajusta fonte e apresentação." active={store.activeProfiles.includes('cognitive')} onClick={() => store.toggleProfile('cognitive')} />
                <ProfileCard icon={Focus} title="TDAH / concentração" desc="Modo foco com faixa horizontal e menos distrações." active={store.activeProfiles.includes('adhd')} onClick={() => store.toggleProfile('adhd')} />
                <ProfileCard icon={ShieldCheck} title="Epilepsia / sensibilidade" desc="Reduz movimento CSS e silencia mídias. Não garante segurança para fotossensibilidade." active={store.activeProfiles.includes('epilepsy')} onClick={() => store.toggleProfile('epilepsy')} />
                <ProfileCard icon={Globe} title="Daltonismo (protanopia)" desc="Reforça bordas, padrões e links sem depender apenas da cor." active={store.activeProfiles.includes('protanopia')} onClick={() => store.toggleProfile('protanopia')} />
                <ProfileCard icon={Globe} title="Daltonismo (deuteranopia)" desc="Reforça bordas, padrões e links sem depender apenas da cor." active={store.activeProfiles.includes('deuteranopia')} onClick={() => store.toggleProfile('deuteranopia')} />
                <ProfileCard icon={Globe} title="Daltonismo (tritanopia)" desc="Reforça bordas, padrões e links sem depender apenas da cor." active={store.activeProfiles.includes('tritanopia')} onClick={() => store.toggleProfile('tritanopia')} />
              </div>
            </div>

            <div inert={currentMenu === 'main'} aria-hidden={currentMenu === 'main'} className={`absolute inset-0 w-full h-full flex flex-col bg-white transition-transform duration-300 ease-in-out ${currentMenu !== 'main' ? 'translate-x-0' : (isLeft ? 'translate-x-full' : '-translate-x-full')}`}>
              
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white shrink-0">
                <button type="button" ref={backBtnRef} onClick={() => setCurrentMenu('main')} aria-label="Voltar" className="p-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"><ArrowLeft size={16} aria-hidden="true" /></button>
                <h3 className="font-bold text-slate-800 text-[14px] uppercase tracking-wide" aria-live="polite" aria-atomic="true">
                  {currentMenu === 'visual' && 'Configurações Visuais'}
                  {currentMenu === 'text' && 'Texto e Leitura'}
                  {currentMenu === 'nav' && 'Navegação e Foco'}
                  {currentMenu === 'audio' && 'Áudio e Leitura'}
                  {currentMenu === 'focus' && 'Foco e Animações'}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto a11y-no-scrollbar p-6" tabIndex={-1}>
                
                {currentMenu === 'visual' && (
                  <>
                    <div className="py-4 border-b border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">CORES E CONTRASTE</span>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button type="button" aria-pressed={store.highContrast === 0 && !store.invertColors} onClick={() => { store.updateValue('highContrast', 0); store.updateValue('invertColors', false); }} className={`px-4 py-2 rounded-lg text-[13px] font-semibold border transition-all ${(store.highContrast === 0 && !store.invertColors) ? 'bg-emerald-800 border-emerald-900 text-white shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>Padrão</button>
                        <button type="button" aria-pressed={store.highContrast > 0} onClick={() => store.updateValue('highContrast', store.highContrast > 0 ? 0 : 50)} className={`px-4 py-2 rounded-lg text-[13px] font-semibold border transition-all ${store.highContrast > 0 ? 'bg-emerald-800 border-emerald-900 text-white shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>Alto Contraste</button>
                        <button type="button" aria-pressed={store.invertColors} onClick={() => store.updateValue('invertColors', !store.invertColors)} className={`px-4 py-2 rounded-lg text-[13px] font-semibold border transition-all ${store.invertColors ? 'bg-emerald-800 border-emerald-900 text-white shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>Inverter Cores</button>
                      </div>
                      {store.highContrast > 0 && <div className="mt-4 border-t border-slate-100 pt-2 animate-in fade-in slide-in-from-top-2"><RangeSliderRow label="Nível de Contraste" value={store.highContrast} min={10} max={100} step={10} onChange={(v:number) => store.updateValue('highContrast', v)} /></div>}
                    </div>
                    <RangeSliderRow label="Saturação" value={store.saturation} min={0} max={200} step={10} onChange={(v:number) => store.updateValue('saturation', v)} />
                    <RangeSliderRow label="Brilho" value={store.brightness} min={50} max={150} step={10} onChange={(v:number) => store.updateValue('brightness', v)} />
                    <p className="text-[13px] text-slate-700 mt-3">Os modos abaixo reforçam sinais visuais; não simulam nem corrigem a visão de cores.</p>
                    <SelectGroup label="APOIO À DIFERENCIAÇÃO DE CORES" currentValue={store.daltonism} onChange={(value) => store.updateValue('daltonism', value as A11yPreferences['daltonism'])} options={[{label:'Desativado', value:'none'}, {label:'Protanopia', value:'protanopia'}, {label:'Deuteranopia', value:'deuteranopia'}, {label:'Tritanopia', value:'tritanopia'}, {label:'Zero Saturação', value:'monochromatic'}]} />
                  </>
                )}

                {currentMenu === 'text' && (
                  <>
                    <div className="space-y-1">
                      <RangeSliderRow label="Tamanho do texto" value={store.textSize} min={100} max={200} step={5} onChange={(v:number) => store.updateValue('textSize', v)} />
                      <RangeSliderRow label="Escala da página" value={store.pageScale} min={100} max={200} step={10} onChange={(v:number) => store.updateValue('pageScale', v)} />
                      <RangeSliderRow label="Espaçamento entre letras" value={store.letterSpacing} min={0} max={10} step={1} unit="px" onChange={(v:number) => store.updateValue('letterSpacing', v)} />
                      <RangeSliderRow label="Espaçamento entre palavras" value={store.wordSpacing} min={0} max={10} step={1} unit="px" onChange={(v:number) => store.updateValue('wordSpacing', v)} />
                      <RangeSliderRow label="Altura da linha" value={store.lineHeight} min={0} max={10} step={1} unit="" onChange={(v:number) => store.updateValue('lineHeight', v)} />
                    </div>
                    <SelectGroup label="ALINHAMENTO DE TEXTO" currentValue={store.textAlign} onChange={(value) => store.updateValue('textAlign', value as A11yPreferences['textAlign'])} options={[{label:'Padrão', value:'default'}, {label:'Esquerda', value:'left'}, {label:'Centro', value:'center'}, {label:'Direita', value:'right'}, {label:'Justificado', value:'justify'}]} />
                    <div className="border-t border-slate-100 pt-2 mt-2">
                      <ToggleSwitch label="Fonte alternativa para leitura" active={store.dyslexiaFont} onChange={(value) => store.updateValue('dyslexiaFont', value)} />
                      <ToggleSwitch label="Fonte legível" active={store.legibleFont} onChange={(value) => store.updateValue('legibleFont', value)} />
                      <ToggleSwitch label="Modo leitura" active={store.readingMode} onChange={(value) => store.updateValue('readingMode', value)} />
                    </div>
                    <div className="border-t border-slate-100 pt-4 mt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Destaques</span>
                      <ToggleSwitch label="Destacar títulos" active={store.highlightTitles} onChange={(value) => store.updateValue('highlightTitles', value)} />
                      <ToggleSwitch label="Destacar links" active={store.highlightLinks} onChange={(value) => store.updateValue('highlightLinks', value)} />
                      <ToggleSwitch label="Destacar botões" active={store.highlightButtons} onChange={(value) => store.updateValue('highlightButtons', value)} />
                    </div>
                  </>
                )}

                {currentMenu === 'nav' && (
                  <>
                    <div className="pb-4 mb-4 border-b border-slate-100">
                      <SelectGroup 
                        label="POSIÇÃO DO BOTÃO" 
                        currentValue={store.widgetPosition} 
                        onChange={(value) => store.updateValue('widgetPosition', value as A11yPreferences['widgetPosition'])}
                        options={[
                          {label:'Sup. Esq.', value:'top-left'},
                          {label:'Sup. Dir.', value:'top-right'},
                          {label:'Meio Esq.', value:'center-left'},
                          {label:'Meio Dir.', value:'center-right'},
                          {label:'Inf. Esq.', value:'bottom-left'}, 
                          {label:'Inf. Dir.', value:'bottom-right'}
                        ]} 
                      />
                    </div>

                    <ToggleSwitch label="Dicas de navegação por teclado" description="Ative e pressione a tecla 'Tab' para navegar." active={store.keyboardTips} onChange={(value) => store.updateValue('keyboardTips', value)} />
                    <ToggleSwitch label="Destacar foco sob o mouse" description="Aplica uma borda visível em elementos clicáveis." active={store.hoverFocus} onChange={(value) => store.updateValue('hoverFocus', value)} />
                    
                    <SelectGroup label="TAMANHO DO CURSOR" currentValue={store.cursorSize} onChange={(value) => store.updateValue('cursorSize', value as A11yPreferences['cursorSize'])} options={[{label:'Padrão', value:'default'}, {label:'Médio', value:'medium'}, {label:'Grande', value:'large'}]} />
                    <SelectGroup label="COR DO CURSOR" currentValue={store.cursorColor} onChange={(value) => store.updateValue('cursorColor', value as A11yPreferences['cursorColor'])} options={[{label:'Padrão', value:'default'}, {label:'Preto', value:'black'}, {label:'Branco', value:'white'}, {label:'Amarelo', value:'yellow'}]} />
                    <SelectGroup label="FERRAMENTAS DE FOCO" currentValue={store.readingGuide} onChange={(value) => store.updateValue('readingGuide', value as A11yPreferences['readingGuide'])} options={[{label:'Desligado', value:'none'}, {label:'Guia de leitura', value:'line'}, {label:'Faixa horizontal', value:'mask'}, {label:'Foco com luz', value:'spotlight'}]} />
                  </>
                )}

                {currentMenu === 'audio' && (
                  <>
                    <ToggleSwitch label="Leitura ao clicar" description="Clique em textos do conteúdo para escutar. Links e controles mantêm sua ação normal." active={store.ttsEnabled} onChange={(value) => { store.updateValue('ttsEnabled', value); if (!value) handleStop(); }} />
                    <ToggleSwitch label="Silenciar mídias" description="Silencia mídias na área de conteúdo e restaura o estado anterior ao desativar." active={store.muteMedia} onChange={(value) => store.updateValue('muteMedia', value)} />

                    <div className="mb-6 pt-4 border-t border-slate-100 mt-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Leitura em voz alta</span>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button type="button" onClick={handleReadSelected} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors bg-white shadow-sm focus:ring-2 focus:ring-emerald-700">Ler texto selecionado</button>
                        <button type="button" onClick={handleReadPage} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors bg-white shadow-sm focus:ring-2 focus:ring-emerald-700">Ler página</button>
                        <button type="button" onClick={handlePauseResume} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors bg-white shadow-sm focus:ring-2 focus:ring-emerald-700">Pausar / Retomar</button>
                        <button type="button" onClick={handleStop} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:border-red-500 hover:text-red-700 transition-colors bg-white shadow-sm focus:ring-2 focus:ring-red-700">Parar</button>
                      </div>
                      <div className="border-t border-slate-100 pt-3">
                        <RangeSliderRow label="Velocidade" value={store.ttsSpeed} min={50} max={500} step={10} onChange={changeSpeed} />
                      </div>
                    </div>
                  </>
                )}

                {currentMenu === 'focus' && (
                  <>
                    <div className="mb-8">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Animações e Interações</span>
                      <ToggleSwitch label="Pausar animações" description="Pausa animações CSS. Efeitos JavaScript precisam de integração própria." active={store.pauseAnimations} onChange={(value) => store.updateValue('pauseAnimations', value)} />
                      <ToggleSwitch label="Reduzir movimento" description="Reduz animações e transições CSS. A preferência do sistema também é respeitada." active={store.reduceMotion} onChange={(value) => store.updateValue('reduceMotion', value)} />
                      <div className="pt-2 border-t border-slate-100 mt-2">
                        <ToggleSwitch label="Ocultar imagens (Foco Extremo)" description="Oculta imagens não interativas e vídeos sem controles, mantendo alternativas acessíveis." active={store.hideImages} onChange={(value) => store.updateValue('hideImages', value)} />
                      </div>
                    </div>
                    <div className="py-4 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Perfis Relacionados</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ProfileCard icon={BrainCircuit} title="Cognitivo" desc="Reduz distrações e ajusta a apresentação da página." active={store.activeProfiles.includes('cognitive')} onClick={() => store.toggleProfile('cognitive')} />
                        <ProfileCard icon={Focus} title="TDAH / concentração" desc="Modo foco com faixa horizontal e menos distrações." active={store.activeProfiles.includes('adhd')} onClick={() => store.toggleProfile('adhd')} />
                        <ProfileCard icon={ShieldCheck} title="Epilepsia / sensibilidade" desc="Reduz movimento CSS. Conteúdo que pisca exige revisão na aplicação." active={store.activeProfiles.includes('epilepsy')} onClick={() => store.toggleProfile('epilepsy')} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          <p role="status" aria-live="polite" className="px-4 text-[13px] text-slate-700">{statusMessage}</p>
          <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between">
            <button type="button" onClick={() => { handleStop(); store.resetAll(); }} aria-label="Redefinir todas as configurações" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[13px] uppercase tracking-widest rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-colors w-full">
              <RotateCcw size={15} aria-hidden="true" /> Redefinir tudo
            </button>
          </div>

        </dialog>
      </div>
    </>
  );
}
