(() => {
  const sourcePage = document.body.dataset.sourcePage || 'index.html';
  const sourceBase = 'https://atmosstudioteam.github.io/Atmos-Studio/';
  const placeholder = document.getElementById('page-root');

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  const absoluteSourceUrl = (value) => {
    if (!value) return value;
    if (/^(?:https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;
    return new URL(value, sourceBase + sourcePage).href;
  };

  const installSourceStyles = (parsed) => {
    parsed.head.querySelectorAll('style').forEach((sourceStyle) => {
      const style = document.createElement('style');
      style.dataset.sourceFallback = 'true';
      style.textContent = sourceStyle.textContent;
      document.head.appendChild(style);
    });

    parsed.head.querySelectorAll('link[rel="stylesheet"]').forEach((sourceLink) => {
      const href = sourceLink.getAttribute('href');
      if (!href) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = absoluteSourceUrl(href);
      link.dataset.sourceFallback = 'true';
      document.head.appendChild(link);
    });

    let redesign = document.querySelector('link[data-source-redesign]');
    if (!redesign) {
      redesign = document.createElement('link');
      redesign.rel = 'stylesheet';
      redesign.dataset.sourceRedesign = 'true';
      redesign.href = new URL('./source-overrides.css?v=20260905-2', window.location.href).href;
    }
    document.head.appendChild(redesign);
  };

  const rewriteLocalAssets = (container) => {
    container.querySelectorAll('[src]').forEach((node) => {
      const value = node.getAttribute('src');
      if (!value) return;
      if (value.startsWith('./assets/')) node.setAttribute('src', absoluteSourceUrl(value));
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

      installSourceStyles(parsed);

      document.body.className = parsed.body.className;
      document.body.dataset.sourcePage = sourcePage;

      const main = document.importNode(sourceMain, true);
      placeholder.replaceWith(main);
      rewriteLocalAssets(main);
      addRevealTargets(main);

      await loadScript(sourceBase + 'language-switcher.js?v=20260811-3');

      if (sourcePage === 'builds.html') {
        await Promise.all([
          loadScript(sourceBase + 'mods-dialog.js'),
          loadScript(sourceBase + 'release-notice.js')
        ]);
      }

      document.documentElement.classList.add('source-ready');
    } catch (error) {
      placeholder.innerHTML = `
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
