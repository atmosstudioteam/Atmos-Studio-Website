(() => {
  const sourcePage = document.body.dataset.sourcePage || 'index.html';
  const sourceBase = 'https://atmosstudioteam.github.io/Atmos-Studio/';
  const root = document.getElementById('page-root');

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  const rewriteLocalAssets = (container) => {
    container.querySelectorAll('[src]').forEach((node) => {
      const value = node.getAttribute('src');
      if (!value) return;
      if (value.startsWith('./assets/')) {
        node.setAttribute('src', sourceBase + value.slice(2));
      }
    });
  };

  const addRevealTargets = (container) => {
    container.querySelectorAll(
      '.hero, .content-section, .cta-section, .document, .build-card, .download-card, .other-project-card, footer'
    ).forEach((node) => node.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    container.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
  };

  const load = async () => {
    try {
      const response = await fetch(sourceBase + sourcePage, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const sourceMain = parsed.querySelector('main.page');

      if (!sourceMain) throw new Error('Source page structure was not found');

      const sourceTitle = parsed.querySelector('title');
      const sourceDescription = parsed.querySelector('meta[name="description"]');
      if (sourceTitle) document.title = sourceTitle.textContent;
      if (sourceDescription) {
        let current = document.querySelector('meta[name="description"]');
        if (!current) {
          current = document.createElement('meta');
          current.name = 'description';
          document.head.appendChild(current);
        }
        current.content = sourceDescription.content;
      }

      document.body.className = parsed.body.className;
      document.body.dataset.sourcePage = sourcePage;
      root.replaceChildren(...sourceMain.childNodes);

      rewriteLocalAssets(root);
      addRevealTargets(root);

      await loadScript(sourceBase + 'language-switcher.js?v=20260811-3');

      if (sourcePage === 'builds.html') {
        await Promise.all([
          loadScript(sourceBase + 'mods-dialog.js'),
          loadScript(sourceBase + 'release-notice.js')
        ]);
      }
    } catch (error) {
      root.innerHTML = `
        <main class="page load-error-page">
          <section class="load-error-card">
            <span class="brand-mark"></span>
            <h1>Atmos Studio</h1>
            <p>The page could not be loaded from the original Atmos Studio source.</p>
            <a href="${sourceBase + sourcePage}" target="_blank" rel="noopener noreferrer">Open original page ↗</a>
          </section>
        </main>`;
      console.error(error);
    }
  };

  load();
})();
