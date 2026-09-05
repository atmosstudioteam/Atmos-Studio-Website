const root = document.documentElement;
const toggles = document.querySelectorAll('[data-language-toggle]');

function setLanguage(lang) {
  const normalized = lang === 'ru' ? 'ru' : 'en';
  root.dataset.lang = normalized;
  root.lang = normalized;
  localStorage.setItem('atmos-language', normalized);

  document.querySelectorAll('[data-en][data-ru]').forEach((element) => {
    element.textContent = element.dataset[normalized];
  });

  document.querySelectorAll('[data-legal-lang]').forEach((element) => {
    element.hidden = element.dataset.legalLang !== normalized;
  });

  toggles.forEach((toggle) => {
    toggle.textContent = normalized === 'en' ? 'RU' : 'EN';
    toggle.setAttribute(
      'aria-label',
      normalized === 'en' ? 'Switch to Russian' : 'Switch to English'
    );
  });
}

const savedLanguage = localStorage.getItem('atmos-language');
setLanguage(savedLanguage === 'ru' ? 'ru' : 'en');

toggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    setLanguage(root.dataset.lang === 'en' ? 'ru' : 'en');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

async function loadLegalDocument() {
  const target = document.querySelector('[data-legal-source]');
  if (!target) return;

  const source = target.dataset.legalSource;

  try {
    const response = await fetch(source, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const english = parsed.querySelector('#english');
    const russian = parsed.querySelector('#russian');

    if (!english || !russian) throw new Error('Language sections were not found');

    target.innerHTML = '';

    [
      ['en', english],
      ['ru', russian]
    ].forEach(([lang, sourceElement]) => {
      const article = document.createElement('article');
      article.className = 'legal-document reveal visible';
      article.dataset.legalLang = lang;
      article.lang = lang;
      article.innerHTML = sourceElement.innerHTML;

      article.querySelectorAll('script, style, link[rel="stylesheet"]').forEach((node) => node.remove());
      target.appendChild(article);
    });

    setLanguage(root.dataset.lang);
  } catch (error) {
    target.innerHTML = `
      <div class="legal-error">
        <strong>Unable to load the legal document.</strong>
        <p>The original document is still available from the Atmos Studio source website.</p>
        <a class="button button-primary" href="${source}" target="_blank" rel="noopener noreferrer">Open original document ↗</a>
      </div>
    `;
  }
}

loadLegalDocument();
