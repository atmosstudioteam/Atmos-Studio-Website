const root = document.documentElement;
const toggle = document.querySelector('[data-language-toggle]');

function setLanguage(lang) {
  root.dataset.lang = lang;
  root.lang = lang === 'ru' ? 'ru' : 'en';
  localStorage.setItem('atmos-language', lang);

  document.querySelectorAll('[data-en][data-ru]').forEach((element) => {
    element.textContent = element.dataset[lang];
  });

  if (toggle) {
    toggle.textContent = lang === 'en' ? 'RU' : 'EN';
    toggle.setAttribute('aria-label', lang === 'en' ? 'Switch to Russian' : 'Switch to English');
  }
}

const savedLanguage = localStorage.getItem('atmos-language');
setLanguage(savedLanguage === 'ru' ? 'ru' : 'en');

if (toggle) {
  toggle.addEventListener('click', () => {
    setLanguage(root.dataset.lang === 'en' ? 'ru' : 'en');
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
