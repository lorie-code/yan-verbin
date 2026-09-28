(() => {
  'use strict';

  const root = document.documentElement;
  const storageKey = 'yan-verbin-language-preference';
  const config = window.YAN_CONFIG || {};
  const defaultLanguage = config.defaultLanguage === 'en' ? 'en' : 'ru';
  const translations = window.YAN_TRANSLATIONS || {};
  const defaultLinks = {
    telegram: 'https://t.me/+JQRJCw2XdHI0MGFi',
    weex: 'https://www.weex.com/events/welcome-event?vipCode=syd0',
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const textNodes = Array.from(document.querySelectorAll('[data-i18n]'));
  const ariaNodes = Array.from(document.querySelectorAll('[data-i18n-aria]'));
  const initialText = new Map(textNodes.map(node => [node, node.textContent]));
  const initialAria = new Map(ariaNodes.map(node => [node, node.getAttribute('aria-label') || '']));
  const initialTitle = document.title;
  const description = document.querySelector('meta[name="description"]');
  const initialDescription = description ? description.content : '';
  const languageButtons = Array.from(document.querySelectorAll('[data-lang]'));
  let language = defaultLanguage;

  function translation(key, fallback) {
    const dictionary = translations[language] || {};
    const english = translations.en || {};
    const resolve = source => {
      if (Object.prototype.hasOwnProperty.call(source, key)) return source[key];
      return key.split('.').reduce((value, part) => (
        value && typeof value === 'object' ? value[part] : undefined
      ), source);
    };
    const value = resolve(dictionary);
    if (typeof value === 'string') return value;
    const englishValue = resolve(english);
    return typeof englishValue === 'string' ? englishValue : fallback;
  }

  function safeLink(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    } catch {
      return null;
    }
  }

  document.querySelectorAll('a[data-link]').forEach(anchor => {
    const key = anchor.dataset.link;
    const configured = config.links && config.links[key];
    const href = safeLink(configured) || safeLink(defaultLinks[key]);
    if (href) {
      anchor.href = href;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
  });

  const marquee = document.querySelector('.market-marquee');
  const motionToggle = document.getElementById('motion-toggle');
  let manuallyPaused = false;

  function updateMotion() {
    const reduced = reducedMotion.matches;
    const paused = reduced || manuallyPaused;
    if (marquee) {
      marquee.classList.toggle('is-paused', paused);
      marquee.classList.toggle('is-reduced', reduced);
    }
    if (!motionToggle) return;
    const key = reduced ? 'motion.reduced' : paused ? 'motion.resume' : 'motion.pause';
    const fallbacks = language === 'ru'
      ? { 'motion.reduced': 'Анимация отключена', 'motion.resume': 'Продолжить анимацию', 'motion.pause': 'Приостановить анимацию' }
      : { 'motion.reduced': 'Motion reduced', 'motion.resume': 'Resume motion', 'motion.pause': 'Pause motion' };
    const label = translation(key, fallbacks[key]);
    const labelNode = motionToggle.querySelector('[data-motion-label]');
    if (labelNode) labelNode.textContent = label;
    else motionToggle.textContent = label;
    motionToggle.setAttribute('aria-label', label);
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.disabled = reduced;
  }

  function setLanguage(nextLanguage, persist = true) {
    language = nextLanguage === 'en' || nextLanguage === 'ru' ? nextLanguage : defaultLanguage;
    root.lang = language;
    root.dataset.language = language;
    textNodes.forEach(node => {
      node.textContent = translation(node.dataset.i18n, initialText.get(node));
    });
    ariaNodes.forEach(node => {
      node.setAttribute('aria-label', translation(node.dataset.i18nAria, initialAria.get(node)));
    });
    languageButtons.forEach(button => {
      const selected = button.dataset.lang === language;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-active', selected);
    });
    document.title = translation('meta.title', initialTitle);
    if (description) description.content = translation('meta.description', initialDescription);
    updateMotion();
    updateMenuLabel();
    if (persist) {
      try { window.localStorage.setItem(storageKey, language); } catch { /* The page also works without storage. */ }
    }
    document.dispatchEvent(new CustomEvent('yan:languagechange', { detail: { language } }));
  }

  function updateMenuLabel() {
    const toggle = document.getElementById('menu-toggle');
    if (!toggle) return;
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-label', translation(
      open ? 'aria.menuClose' : 'aria.menuOpen',
      open ? 'Close navigation' : 'Open navigation'
    ));
  }

  languageButtons.forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  });

  let storedLanguage = defaultLanguage;
  try {
    const preference = window.localStorage.getItem(storageKey);
    if (preference === 'ru' || preference === 'en') storedLanguage = preference;
  } catch { /* Keep the configured default when storage is unavailable. */ }
  setLanguage(storedLanguage, false);

  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      manuallyPaused = !manuallyPaused;
      updateMotion();
    });
  }
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', updateMotion);
  else if (reducedMotion.addListener) reducedMotion.addListener(updateMotion);

  const menuToggle = document.getElementById('menu-toggle');
  const siteNav = document.getElementById('site-nav');
  const header = document.querySelector('.site-header');
  const hero = document.getElementById('home');
  const mobileCta = document.getElementById('mobile-cta');
  const progress = document.getElementById('reading-progress');
  let menuOpen = false;
  let updatePending = false;

  function mobileMenuEnabled() {
    return menuToggle && window.getComputedStyle(menuToggle).display !== 'none';
  }

  function updateNavigationVisibility() {
    if (!siteNav) return;
    const collapsed = mobileMenuEnabled() && !menuOpen;
    siteNav.inert = collapsed;
    if (collapsed) siteNav.setAttribute('aria-hidden', 'true');
    else siteNav.removeAttribute('aria-hidden');
  }

  function updatePagePosition() {
    updatePending = false;
    const scrollTop = Math.max(0, window.scrollY || root.scrollTop);
    const scrollableHeight = Math.max(0, root.scrollHeight - window.innerHeight);
    const ratio = scrollableHeight ? Math.min(1, scrollTop / scrollableHeight) : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (header) header.classList.toggle('is-scrolled', scrollTop > 24);
    if (mobileCta) {
      const pastHero = hero ? hero.getBoundingClientRect().bottom <= 80 : scrollTop > 500;
      const visible = pastHero && !menuOpen;
      mobileCta.classList.toggle('is-visible', visible);
      mobileCta.classList.toggle('is-hidden', !visible);
      mobileCta.setAttribute('aria-hidden', String(!visible));
      mobileCta.inert = !visible;
    }
  }

  function requestPositionUpdate() {
    if (!updatePending) {
      updatePending = true;
      window.requestAnimationFrame(updatePagePosition);
    }
  }

  function setMenu(open, restoreFocus = false) {
    menuOpen = Boolean(open && mobileMenuEnabled());
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(menuOpen));
      menuToggle.classList.toggle('is-open', menuOpen);
      updateMenuLabel();
    }
    if (siteNav) siteNav.classList.toggle('is-open', menuOpen);
    if (header) header.classList.toggle('is-menu-open', menuOpen);
    document.body.classList.toggle('menu-open', menuOpen);
    updateNavigationVisibility();
    updatePagePosition();
    if (restoreFocus && menuToggle) menuToggle.focus();
  }

  if (menuToggle && siteNav) {
    menuToggle.setAttribute('aria-controls', siteNav.id);
    menuToggle.addEventListener('click', () => {
      setMenu(!menuOpen);
      if (menuOpen) siteNav.querySelector('a[href]')?.focus();
    });
    siteNav.querySelectorAll('a[href]').forEach(anchor => {
      anchor.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('click', event => {
      if (menuOpen && !siteNav.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (!menuOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false, true);
      }
    });
    setMenu(false);
  }

  window.addEventListener('scroll', requestPositionUpdate, { passive: true });
  window.addEventListener('resize', () => {
    if (!mobileMenuEnabled() && menuOpen) setMenu(false);
    updateNavigationVisibility();
    requestPositionUpdate();
  }, { passive: true });
  window.addEventListener('load', requestPositionUpdate, { once: true });
  document.addEventListener('yan:languagechange', requestPositionUpdate);
  updatePagePosition();

  const methodTabs = Array.from(document.querySelectorAll('[data-method]')).filter(tab => (
    document.getElementById(`method-${tab.dataset.method}`)
  ));
  const methodVisual = document.querySelector('.method-visual');

  function selectMethod(id, moveFocus = false) {
    methodTabs.forEach(tab => {
      const selected = tab.dataset.method === id;
      const panel = document.getElementById(`method-${tab.dataset.method}`);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.classList.toggle('is-active', selected);
      panel.hidden = !selected;
      panel.classList.toggle('is-active', selected);
      if (selected && moveFocus) tab.focus();
    });
    if (methodVisual) methodVisual.dataset.active = id;
    requestPositionUpdate();
  }

  if (methodTabs.length) {
    methodTabs.forEach((tab, index) => {
      const id = tab.dataset.method;
      const panel = document.getElementById(`method-${id}`);
      if (!tab.id) tab.id = `method-tab-${id}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      if (!panel.hasAttribute('tabindex')) panel.tabIndex = 0;
      tab.addEventListener('click', () => selectMethod(id));
      tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % methodTabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + methodTabs.length) % methodTabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = methodTabs.length - 1;
        else return;
        event.preventDefault();
        selectMethod(methodTabs[next].dataset.method, true);
      });
    });
    const initialMethod = methodTabs.find(tab => tab.getAttribute('aria-selected') === 'true') || methodTabs[0];
    selectMethod(initialMethod.dataset.method);
  }

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight) element.classList.add('is-visible');
      else revealObserver.observe(element);
    });
  } else {
    reveals.forEach(element => element.classList.add('is-visible'));
  }

  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[data-link], a[data-cta]');
    if (!anchor) return;
    document.dispatchEvent(new CustomEvent('yan:cta', {
      detail: {
        destination: anchor.dataset.link || anchor.dataset.cta || '',
        placement: anchor.dataset.placement || anchor.closest('section, header, footer')?.id || '',
        language,
      },
    }));
  });

  root.classList.add('js');
})();
