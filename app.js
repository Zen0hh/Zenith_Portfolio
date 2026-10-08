// ============================================================
// Zenith's Portfolio — Application Engine
// Style: Portfolio-Lab Paper & Ink Editorial Engine
// Lightweight, blazing fast, 0 lag, in-page video playback
// ============================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'zenith_portfolio_shelf_v3';
  const PALETTE = ['#bcdcff', '#dfff62', '#ff735f', '#cdbdff', '#bde8d5'];
  const SOURCE_NAMES = {
    youtube: 'YouTube',
    drive: 'Google Drive',
    vimeo: 'Vimeo',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    direct: 'Direct video',
    link: 'External link'
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const CFG = typeof PORTFOLIO_CONFIG !== 'undefined' ? PORTFOLIO_CONFIG : {};
  const DEFAULT_ITEMS = typeof PORTFOLIO_ITEMS !== 'undefined' ? PORTFOLIO_ITEMS : [];

  let items = loadItems();
  let activeFilter = 'all';
  let toastTimer = null;

  // ── Initialization ────────────────────────────────────────
  function init() {
    populateConfig();
    renderAll();
    setupModals();
    setupContactForm();
    setupFAQ();
    setupExperienceAccordion();
    setupRailControls();
    setupCuratorPanel();
    checkHashDeepLink();
    window.addEventListener('hashchange', checkHashDeepLink);
  }

  // ── Data Persistence & Sync ───────────────────────────────
  const DELETED_KEY = 'zenith_portfolio_deleted_cuts_v3';

  function getDeletedIds() {
    try {
      const arr = JSON.parse(localStorage.getItem(DELETED_KEY));
      if (Array.isArray(arr)) return arr;
    } catch (e) {}
    return [];
  }

  function addDeletedId(id) {
    const arr = getDeletedIds();
    if (!arr.includes(id)) {
      arr.push(id);
      localStorage.setItem(DELETED_KEY, JSON.stringify(arr));
    }
  }

  function clearDeletedIds() {
    localStorage.removeItem(DELETED_KEY);
  }

  function loadItems() {
    const deleted = getDeletedIds();
    try {
      let saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length > 0) {
        // Keep non-deleted saved items
        const currentList = saved.filter(it => !deleted.includes(it.id));

        // Merge in any newly added videos from data.js (PORTFOLIO_ITEMS)
        DEFAULT_ITEMS.forEach(defaultItem => {
          if (!deleted.includes(defaultItem.id)) {
            const exists = currentList.find(it => it.id === defaultItem.id || (it.url && it.url === defaultItem.url));
            if (!exists) {
              currentList.push(defaultItem);
            }
          }
        });
        return currentList;
      }
    } catch (e) {}
    return DEFAULT_ITEMS.filter(it => !deleted.includes(it.id));
  }

  function saveItems() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  // ── URL & Media Parsing ───────────────────────────────────
  function inferSource(url) {
    if (!url) return 'link';
    const lower = url.toLowerCase();
    if (lower.includes('youtu.be') || lower.includes('youtube.com')) return 'youtube';
    if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) return 'drive';
    if (lower.includes('vimeo.com')) return 'vimeo';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (/\.(mp4|webm|mov|ogg)(\?|#|$)/i.test(lower)) return 'direct';
    return 'link';
  }

  function extractYouTubeId(url) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1).split('/')[0];
      return parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();
    } catch (e) {
      const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
      return m ? m[1] : '';
    }
  }

  function extractDriveId(url) {
    const m = url.match(/\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
    return m ? m[1] : '';
  }

  function extractVimeoId(url) {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    return m ? m[1] : '';
  }

  function getThumbnailUrl(item) {
    if (item.thumbnail) return item.thumbnail;
    const src = item.source || inferSource(item.url);
    if (src === 'youtube') {
      const id = extractYouTubeId(item.url);
      return id ? `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : '';
    }
    if (src === 'drive') {
      const id = extractDriveId(item.url);
      return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1000` : '';
    }
    if (src === 'vimeo') {
      const id = extractVimeoId(item.url);
      return id ? `https://vumbnail.com/${encodeURIComponent(id)}.jpg` : '';
    }
    return '';
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[ch]));
  }

  // ── Populate Site Config (Zenith info) ────────────────────
  function populateConfig() {
    const contact = CFG.contact || {};
    $$('[data-cfg="email"]').forEach(el => {
      el.textContent = contact.email;
      if (el.tagName === 'A') el.href = `mailto:${contact.email}`;
    });
    $$('[data-cfg="phone"]').forEach(el => {
      el.textContent = contact.phone;
      if (el.tagName === 'A') el.href = `tel:${(contact.phone || '').replace(/\s/g, '')}`;
    });
    $$('[data-cfg="whatsapp"]').forEach(el => {
      if (contact.whatsapp && el.tagName === 'A') {
        el.href = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent("Hi Zenith! I saw your portfolio and I'd like to discuss a video editing project.")}`;
      }
    });
    $$('[data-cfg="year"]').forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  // ── Rendering Grid & Front Row ────────────────────────────
  function renderAll() {
    renderStats();
    renderFeaturedRail();
    renderFilters();
    renderWorkGrid();
    bindCardClicks();
  }

  function renderStats() {
    const countEl = $('[data-stat-count]');
    if (countEl) countEl.textContent = String(items.length).padStart(2, '0');
  }

  function posterMarkup(item, index) {
    const thumb = getThumbnailUrl(item);
    const source = item.source || inferSource(item.url);
    const safeTitle = escapeHtml(item.title);
    const imageTag = thumb
      ? `<img class="poster-thumbnail" src="${escapeHtml(thumb)}" alt="${safeTitle}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove(); this.closest('.poster-surface')?.classList.remove('has-thumbnail')">`
      : '';
    const glyphText = item.glyph || String(index + 1).padStart(2, '0');

    return `
      ${imageTag}
      <div class="poster-tint"></div>
      <div class="poster-meta">
        <span class="source-label">${escapeHtml(SOURCE_NAMES[source] || 'Video')}</span>
      </div>
    `;
  }

  function renderFeaturedRail() {
    const rail = $('[data-featured-rail]');
    if (!rail) return;
    const featured = items.filter(it => it.featured).slice(0, 6);
    if (!featured.length) {
      rail.innerHTML = '<div class="empty-state">No featured cuts selected yet.</div>';
      return;
    }

    rail.innerHTML = featured.map((item, index) => {
      const color = item.color || PALETTE[index % PALETTE.length];
      const hasThumb = getThumbnailUrl(item) ? ' has-thumbnail' : '';
      return `
        <article class="feature-card" data-item-id="${escapeHtml(item.id)}" style="--card-color:${escapeHtml(color)}" tabindex="0" role="button" aria-label="Play ${escapeHtml(item.title)}">
          <div class="feature-poster poster-surface${hasThumb}">${posterMarkup(item, index)}</div>
          <div class="feature-info">
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.description || item.role || 'A cinematic piece from the shelf.')}</p>
            </div>
            <div class="feature-play-row">
              <button class="play-button" type="button" aria-label="Play ${escapeHtml(item.title)}">
                <span class="triangle">▶</span>
              </button>
              <span class="feature-duration">${escapeHtml(item.duration || item.role || 'Watch')}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderFilters() {
    const container = $('[data-filters]');
    if (!container) return;

    // Available categories from current items
    const catKeys = ['all', 'reels', 'cinematic', 'colorgrading', 'motion'];
    const catLabels = {
      all: 'Everything',
      reels: 'Reels & Shorts',
      cinematic: 'Cinematic',
      colorgrading: 'Color Grading',
      motion: 'Motion & VFX'
    };

    const countFor = cat => cat === 'all' ? items.length : items.filter(it => it.category === cat).length;

    container.innerHTML = catKeys.map(cat => {
      const count = countFor(cat);
      if (cat !== 'all' && count === 0) return '';
      const isActive = cat === activeFilter ? ' active' : '';
      return `
        <button class="filter-button${isActive}" type="button" data-filter="${cat}">
          ${escapeHtml(catLabels[cat] || cat)}
          <span class="filter-count">${count}</span>
        </button>
      `;
    }).join('');

    $$('.filter-button', container).forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        renderFilters();
        renderWorkGrid();
        bindCardClicks();
      });
    });
  }

  function renderWorkGrid() {
    const grid = $('[data-work-grid]');
    const archiveCount = $('[data-archive-count]');
    if (!grid) return;

    const filtered = activeFilter === 'all'
      ? items
      : items.filter(it => it.category === activeFilter);

    if (archiveCount) {
      archiveCount.textContent = `${String(filtered.length).padStart(2, '0')} ${filtered.length === 1 ? 'cut' : 'cuts'}`;
    }

    if (!filtered.length) {
      grid.innerHTML = '<div class="empty-state">No cuts in this category yet. Add one with "+ Add a cut" above!</div>';
      return;
    }

    grid.innerHTML = filtered.map((item, index) => {
      const color = item.color || PALETTE[index % PALETTE.length];
      const hasThumb = getThumbnailUrl(item) ? ' has-thumbnail' : '';
      const isPortrait = item.orientation === 'portrait';
      const sizeClass = isPortrait ? 'tall portrait' : (item.orientation === 'square' ? 'short' : 'normal');

      return `
        <article class="work-card ${sizeClass}" data-item-id="${escapeHtml(item.id)}" style="--card-color:${escapeHtml(color)}" tabindex="0" role="button" aria-label="Play ${escapeHtml(item.title)}">
          <div class="work-poster poster-surface${hasThumb}">
            ${posterMarkup(item, index)}
            <button class="play-button" type="button" aria-label="Play ${escapeHtml(item.title)}">
              <span class="triangle">▶</span>
            </button>
          </div>
          <div class="work-info">
            <div class="work-title-row">
              <h3>${escapeHtml(item.title)}</h3>
              <span class="year">${escapeHtml(item.year || '2025')}</span>
            </div>
            <p>${escapeHtml(item.description || item.role || 'Video edit & post-production.')}</p>
            <div class="work-footer">
              <span class="work-category">${escapeHtml(item.role || item.category || 'Edit')}</span>
              <span class="external-mark" aria-hidden="true">↗</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function bindCardClicks() {
    $$('[data-item-id]').forEach(card => {
      const open = () => {
        const id = card.dataset.itemId;
        const item = items.find(it => it.id === id);
        if (item) openPlayerModal(item);
      };
      card.addEventListener('click', e => {
        if (!e.target.closest('a')) open();
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }

  // ── In-Page Video Player Modal ────────────────────────────
  function openPlayerModal(item) {
    const modal = $('[data-player-modal]');
    if (!modal) return;

    $('#player-title').textContent = item.title;
    $('[data-player-description]').textContent = item.description || item.role || 'A video edit by Zenith Onta.';
    $('[data-player-source]').textContent = SOURCE_NAMES[item.source || inferSource(item.url)] || 'Video link';
    $('[data-player-category]').textContent = item.role || item.category || 'Video edit';

    const origLink = $('[data-original-link]');
    if (origLink) origLink.href = item.url;

    const hireLink = $('[data-player-hire]');
    if (hireLink) {
      hireLink.onclick = () => {
        closeModals();
        $('#contact').scrollIntoView({ behavior: 'smooth' });
      };
    }

    const shell = $('[data-player-shell]');
    const source = item.source || inferSource(item.url);
    const safeTitle = escapeHtml(item.title);

    shell.className = `player-shell ${item.orientation === 'portrait' ? 'portrait' : ''}`;

    if (source === 'youtube') {
      const yId = extractYouTubeId(item.url);
      shell.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yId)}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${safeTitle}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (source === 'drive') {
      const dId = extractDriveId(item.url);
      shell.innerHTML = `<iframe src="https://drive.google.com/file/d/${encodeURIComponent(dId)}/preview" title="${safeTitle}" allow="autoplay" allowfullscreen></iframe>`;
    } else if (source === 'vimeo') {
      const vId = extractVimeoId(item.url);
      shell.innerHTML = `<iframe src="https://player.vimeo.com/video/${encodeURIComponent(vId)}?autoplay=1" title="${safeTitle}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    } else if (source === 'direct') {
      shell.innerHTML = `<video controls autoplay playsinline src="${escapeHtml(item.url)}"><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Open video</a></video>`;
    } else {
      const platformName = SOURCE_NAMES[source] || 'this platform';
      shell.innerHTML = `
        <div class="link-fallback">
          <div>
            <span class="fallback-mark">${source === 'instagram' ? 'ig' : source === 'tiktok' ? 'tt' : '▶'}</span>
            <p>${escapeHtml(platformName)} keeps its player on its own site. Click below to watch the original video:</p>
            <a class="pill-button accent" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Open in ${escapeHtml(platformName)} ↗</a>
          </div>
        </div>
      `;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    history.replaceState(null, '', `#play=${encodeURIComponent(item.id)}`);
  }

  function closeModals() {
    $$('.modal-backdrop').forEach(m => m.classList.remove('open'));
    const shell = $('[data-player-shell]');
    if (shell) shell.innerHTML = '';
    document.body.style.overflow = '';
    if (location.hash.startsWith('#play=')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function checkHashDeepLink() {
    const m = location.hash.match(/^#play=(.+)$/);
    if (!m) return;
    const id = decodeURIComponent(m[1]);
    const item = items.find(it => it.id === id);
    if (item) openPlayerModal(item);
  }

  // ── Setup Modals & Buttons ────────────────────────────────
  function setupModals() {
    const addModal = $('[data-add-modal]');

    $$('[data-open-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (addModal) {
          addModal.classList.add('open');
          document.body.style.overflow = 'hidden';
          $('#item-title')?.focus();
        }
      });
    });

    $$('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModals));

    $$('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', e => {
        if (e.target === backdrop) closeModals();
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModals();
    });

    // Handle "+ Add a piece" form submission
    const addForm = $('[data-add-form]');
    if (addForm) {
      addForm.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(addForm);
        const title = String(fd.get('title') || '').trim();
        const url = String(fd.get('url') || '').trim();
        if (!title || !url) return;

        const src = inferSource(url);
        const orientation = fd.get('orientation') || (src === 'instagram' || src === 'tiktok' ? 'portrait' : 'landscape');

        const newItem = {
          id: `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
          title,
          url,
          source: src,
          category: String(fd.get('category') || 'reels'),
          year: String(fd.get('year') || new Date().getFullYear()),
          role: String(fd.get('role') || 'Video Edit'),
          orientation,
          description: String(fd.get('description') || 'A new cut added to the shelf.'),
          thumbnail: String(fd.get('thumbnail') || '').trim(),
          color: String(fd.get('color') || PALETTE[items.length % PALETTE.length]),
          glyph: title.slice(0, 2).toUpperCase(),
          featured: fd.get('featured') === 'on',
          duration: String(fd.get('duration') || 'play')
        };

        items.unshift(newItem);
        saveItems();
        renderAll();
        addForm.reset();
        closeModals();
        showToast(`"${title}" is now on your shelf!`);
        $('#work')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // ── Contact Form & Preselection ───────────────────────────
  function setupContactForm() {
    const form = $('[data-contact-form]');
    const serviceSelect = $('#contact-service');

    // "Start a project" / package buttons preselect the service in contact dropdown
    $$('[data-service-select]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.serviceSelect;
        if (serviceSelect) {
          const opt = Array.from(serviceSelect.options).find(o => o.value === val || o.text.includes(val));
          if (opt) serviceSelect.value = opt.value;
        }
      });
    });

    if (form) {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const statusEl = $('[data-form-status]');
        const submitBtn = form.querySelector('button[type="submit"]');

        const data = Object.fromEntries(new FormData(form).entries());
        if (data._honey) return; // bot detection

        if (statusEl) {
          statusEl.textContent = 'Sending message…';
          statusEl.className = 'form-status';
        }
        if (submitBtn) submitBtn.disabled = true;

        try {
          const res = await fetch(CFG.formEndpoint || 'https://formsubmit.co/ajax/ontazenith@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              ...data,
              _subject: `New editing inquiry from ${data.name} — ${data.service || 'Portfolio'}`
            })
          });

          if (!res.ok) throw new Error('Network error');

          form.reset();
          if (statusEl) {
            statusEl.textContent = "Message sent! Zenith will get back to you within 24 hours.";
            statusEl.className = 'form-status success';
          }
          showToast("Message sent successfully!");
        } catch (err) {
          if (statusEl) {
            statusEl.innerHTML = `Could not send automatically. <a href="mailto:${CFG.contact.email}?subject=Project inquiry&body=${encodeURIComponent(data.message || '')}">Click here to email Zenith directly</a>.`;
            statusEl.className = 'form-status error';
          }
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  }

  // ── FAQ Accordion ─────────────────────────────────────────
  function setupFAQ() {
    $$('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-question');
      if (q) {
        q.addEventListener('click', () => {
          const wasOpen = item.classList.contains('open');
          $$('.faq-item').forEach(other => other.classList.remove('open'));
          if (!wasOpen) item.classList.add('open');
        });
      }
    });
  }

  // ── Experience Dropdown Accordion ─────────────────────────
  function setupExperienceAccordion() {
    $$('.experience-item').forEach(item => {
      const toggle = item.querySelector('.exp-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => {
          const wasOpen = item.classList.contains('open');
          $$('.experience-item').forEach(other => {
            other.classList.remove('open');
            other.querySelector('.exp-toggle')?.setAttribute('aria-expanded', 'false');
          });
          if (!wasOpen) {
            item.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });
  }

  // ── Featured Rail Scroll Buttons ──────────────────────────
  function setupRailControls() {
    const rail = $('[data-featured-rail]');
    const prevBtn = $('[data-rail-prev]');
    const nextBtn = $('[data-rail-next]');
    if (prevBtn && rail) {
      prevBtn.addEventListener('click', () => rail.scrollBy({ left: -440, behavior: 'smooth' }));
    }
    if (nextBtn && rail) {
      nextBtn.addEventListener('click', () => rail.scrollBy({ left: 440, behavior: 'smooth' }));
    }
  }

  // ── Curator / Reorder Panel (Admin Only) ───────────────────
  let dragSrcIndex = null;

  function isCuratorEnabled() {
    const params = new URLSearchParams(window.location.search);
    return params.has('manage') || params.has('admin') || localStorage.getItem('zenith_curator_mode') === 'true';
  }

  function setCuratorEnabled(enabled) {
    if (enabled) {
      localStorage.setItem('zenith_curator_mode', 'true');
    } else {
      localStorage.removeItem('zenith_curator_mode');
    }
    updateCuratorBadgeVisibility();
  }

  function updateCuratorBadgeVisibility() {
    const badge = $('#curatorBadge');
    if (!badge) return;
    badge.style.display = isCuratorEnabled() ? 'inline-flex' : 'none';
  }

  function openCuratorModal() {
    const modal = $('[data-curator-modal]');
    if (!modal) return;
    setCuratorEnabled(true);
    renderCuratorList();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function renderCuratorList() {
    const container = $('[data-curator-list]');
    if (!container) return;

    if (!items.length) {
      container.innerHTML = '<div class="empty-state">No cuts found on shelf. Use "+ Add New Cut" above!</div>';
      return;
    }

    container.innerHTML = items.map((item, index) => {
      const color = item.color || PALETTE[index % PALETTE.length];
      const thumb = getThumbnailUrl(item);
      const isFeatured = !!item.featured;
      const isFirst = index === 0;
      const isLast = index === items.length - 1;

      return `
        <div class="curator-row" data-id="${escapeHtml(item.id)}" data-index="${index}" style="--card-color:${escapeHtml(color)}">
          <div class="curator-item" draggable="true">
            <div class="curator-drag-handle" title="Drag to reorder" aria-label="Drag handle">⋮⋮</div>
            <div class="curator-thumb">
              ${thumb ? `<img src="${escapeHtml(thumb)}" alt="" referrerpolicy="no-referrer">` : escapeHtml((item.title || 'V').slice(0, 2).toUpperCase())}
            </div>
            <div class="curator-info">
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.role || item.category || 'Cut')} • ${escapeHtml(item.duration || 'play')} • ${escapeHtml(item.year || '2025')}</p>
            </div>
            <button class="curator-featured-toggle ${isFeatured ? 'active' : ''}" type="button" data-action="toggle-featured" title="Toggle Front Row showcase">
              <span>${isFeatured ? '★ Front row' : '☆ Showcase'}</span>
            </button>
            <div class="curator-buttons">
              <button class="curator-btn edit" type="button" data-action="toggle-edit" title="Edit title, description & details">✎</button>
              <button class="curator-btn top" type="button" data-action="move-top" title="Move to absolute top (1st place)" ${isFirst ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⤒</button>
              <button class="curator-btn" type="button" data-action="move-up" title="Move up one position" ${isFirst ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>▲</button>
              <button class="curator-btn" type="button" data-action="move-down" title="Move down one position" ${isLast ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>▼</button>
              <button class="curator-btn" type="button" data-action="move-bottom" title="Move to bottom (Last)" ${isLast ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⤓</button>
              <button class="curator-btn del" type="button" data-action="quick-delete" data-id="${escapeHtml(item.id)}" title="Delete this video">🗑</button>
            </div>
          </div>

          <!-- Inline Edit Drawer -->
          <div class="curator-inline-edit" data-edit-panel="${escapeHtml(item.id)}">
            <div class="curator-edit-grid">
              <div class="field full">
                <label>Title</label>
                <input type="text" class="edit-field" data-key="title" value="${escapeHtml(item.title || '')}">
              </div>
              <div class="field">
                <label>Subtitle / Role</label>
                <input type="text" class="edit-field" data-key="role" value="${escapeHtml(item.role || '')}" placeholder="e.g. Edit & VFX">
              </div>
              <div class="field">
                <label>Category</label>
                <select class="edit-field" data-key="category">
                  <option value="reels" ${item.category === 'reels' ? 'selected' : ''}>Reels & Shorts</option>
                  <option value="cinematic" ${item.category === 'cinematic' ? 'selected' : ''}>Cinematic & Brand</option>
                  <option value="colorgrading" ${item.category === 'colorgrading' ? 'selected' : ''}>Color Grading</option>
                  <option value="motion" ${item.category === 'motion' ? 'selected' : ''}>Motion & VFX</option>
                </select>
              </div>
              <div class="field">
                <label>Year</label>
                <input type="text" class="edit-field" data-key="year" value="${escapeHtml(item.year || '2025')}">
              </div>
              <div class="field">
                <label>Duration</label>
                <input type="text" class="edit-field" data-key="duration" value="${escapeHtml(item.duration || 'play')}">
              </div>
              <div class="field full">
                <label>Video URL (Google Drive, YouTube, Vimeo, etc.)</label>
                <input type="url" class="edit-field" data-key="url" value="${escapeHtml(item.url || '')}">
              </div>
              <div class="field full">
                <label>Description / Story</label>
                <textarea class="edit-field" data-key="description" rows="2" placeholder="Tell what you did in this edit...">${escapeHtml(item.description || '')}</textarea>
              </div>
              <div class="field full">
                <label>Custom Thumbnail URL (optional)</label>
                <input type="url" class="edit-field" data-key="thumbnail" value="${escapeHtml(item.thumbnail || '')}" placeholder="Auto-detected if left empty">
              </div>
            </div>
            <div class="curator-edit-actions">
              <div class="curator-edit-actions-left">
                <button class="pill-button accent" type="button" data-action="save-edit" data-id="${escapeHtml(item.id)}" style="padding: 6px 16px; font-size: 11px;">Save Changes ✓</button>
                <button class="pill-button secondary" type="button" data-action="cancel-edit" data-id="${escapeHtml(item.id)}" style="padding: 6px 14px; font-size: 11px;">Close</button>
              </div>
              <button class="curator-delete-btn" type="button" data-action="direct-delete" data-id="${escapeHtml(item.id)}">🗑 Delete Video</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindCuratorEvents();
  }

  function bindCuratorEvents() {
    const list = $('[data-curator-list]');
    if (!list) return;

    // Toggle Edit drawer
    list.querySelectorAll('[data-action="toggle-edit"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const row = btn.closest('.curator-row');
        if (row) {
          row.classList.toggle('is-editing');
        }
      });
    });

    // Cancel / Close Edit drawer
    list.querySelectorAll('[data-action="cancel-edit"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const row = btn.closest('.curator-row');
        if (row) row.classList.remove('is-editing');
      });
    });

    // Save Edit
    list.querySelectorAll('[data-action="save-edit"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const row = btn.closest('.curator-row');
        const item = items.find(it => it.id === id);
        if (!item || !row) return;

        row.querySelectorAll('.edit-field').forEach(input => {
          const key = input.dataset.key;
          if (key) {
            item[key] = input.value.trim();
          }
        });

        // Re-infer source from new URL
        if (item.url) {
          item.source = inferSource(item.url);
        }

        onShelfReordered(`Saved changes for "${item.title}"`);
      });
    });

    // Quick delete on row (2-step click confirmation, no browser popup)
    list.querySelectorAll('[data-action="quick-delete"]').forEach(btn => {
      let resetTimer = null;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const index = items.findIndex(it => it.id === id);
        if (index === -1) return;

        if (!btn.classList.contains('confirm-del')) {
          btn.classList.add('confirm-del');
          btn.textContent = 'Confirm?';
          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            btn.classList.remove('confirm-del');
            btn.textContent = '🗑';
          }, 3500);
        } else {
          clearTimeout(resetTimer);
          const itemTitle = items[index].title;
          addDeletedId(id);
          items.splice(index, 1);
          onShelfReordered(`Removed "${itemTitle}"`);
        }
      });
    });

    // Direct delete inside inline edit drawer (2-step click confirmation)
    list.querySelectorAll('[data-action="direct-delete"]').forEach(btn => {
      let resetTimer = null;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const index = items.findIndex(it => it.id === id);
        if (index === -1) return;

        if (!btn.classList.contains('confirm-state')) {
          btn.classList.add('confirm-state');
          btn.textContent = '⚠️ Click again to confirm delete';
          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            btn.classList.remove('confirm-state');
            btn.textContent = '🗑 Delete Video';
          }, 4000);
        } else {
          clearTimeout(resetTimer);
          const itemTitle = items[index].title;
          addDeletedId(id);
          items.splice(index, 1);
          onShelfReordered(`Removed "${itemTitle}"`);
        }
      });
    });

    // Reorder buttons: move-top, move-up, move-down, move-bottom, toggle-featured
    list.querySelectorAll('[data-action="move-top"], [data-action="move-up"], [data-action="move-down"], [data-action="move-bottom"], [data-action="toggle-featured"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const row = btn.closest('.curator-row');
        const id = row?.dataset.id;
        const index = items.findIndex(it => it.id === id);
        if (index === -1) return;

        if (action === 'move-top') {
          if (index > 0) {
            const [moved] = items.splice(index, 1);
            items.unshift(moved);
            onShelfReordered(`"${moved.title}" moved to top!`);
          }
        } else if (action === 'move-up') {
          if (index > 0) {
            const temp = items[index];
            items[index] = items[index - 1];
            items[index - 1] = temp;
            onShelfReordered(`Moved "${temp.title}" up`);
          }
        } else if (action === 'move-down') {
          if (index < items.length - 1) {
            const temp = items[index];
            items[index] = items[index + 1];
            items[index + 1] = temp;
            onShelfReordered(`Moved "${temp.title}" down`);
          }
        } else if (action === 'move-bottom') {
          if (index < items.length - 1) {
            const [moved] = items.splice(index, 1);
            items.push(moved);
            onShelfReordered(`"${moved.title}" moved to bottom!`);
          }
        } else if (action === 'toggle-featured') {
          items[index].featured = !items[index].featured;
          onShelfReordered(items[index].featured ? 'Added to Front Row' : 'Removed from Front Row');
        }
      });
    });

    // Drag and Drop reordering on .curator-row
    const itemRows = list.querySelectorAll('.curator-row');
    itemRows.forEach(row => {
      const itemEl = row.querySelector('.curator-item');
      if (!itemEl) return;

      itemEl.addEventListener('dragstart', e => {
        dragSrcIndex = parseInt(row.dataset.index, 10);
        row.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(dragSrcIndex));
      });

      row.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        row.classList.add('drop-target');
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('drop-target');
      });

      row.addEventListener('drop', e => {
        e.preventDefault();
        row.classList.remove('drop-target');
        const targetIndex = parseInt(row.dataset.index, 10);
        if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
          const [moved] = items.splice(dragSrcIndex, 1);
          items.splice(targetIndex, 0, moved);
          onShelfReordered(`Moved "${moved.title}" to slot ${targetIndex + 1}`);
        }
      });

      itemEl.addEventListener('dragend', () => {
        itemRows.forEach(r => {
          r.classList.remove('is-dragging');
          r.classList.remove('drop-target');
        });
        dragSrcIndex = null;
      });
    });
  }

  function onShelfReordered(msg) {
    saveItems();
    renderAll();
    renderCuratorList();
    if (msg) showToast(msg);
  }

  function setupCuratorPanel() {
    updateCuratorBadgeVisibility();

    const badge = $('#curatorBadge');
    if (badge) {
      badge.addEventListener('click', openCuratorModal);
    }

    // Secret shortcut: Shift + H (or Shift + M)
    function handleCuratorShortcut(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      const isH = e.code === 'KeyH' || e.key === 'H' || e.key === 'h';
      const isM = e.code === 'KeyM' || e.key === 'M' || e.key === 'm';

      if (e.shiftKey && (isH || isM)) {
        e.preventDefault();
        e.stopPropagation();
        const modal = $('[data-curator-modal]');
        if (modal && modal.classList.contains('open')) {
          closeModals();
        } else {
          openCuratorModal();
        }
      }
    }

    window.addEventListener('keydown', handleCuratorShortcut, true);
    document.addEventListener('keydown', handleCuratorShortcut, true);

    // Secret shortcut 2: Triple-click the brand dot
    let dotClicks = 0;
    let dotClickTimer = null;
    const wordmarkDot = $('.wordmark-dot');
    if (wordmarkDot) {
      wordmarkDot.style.cursor = 'pointer';
      wordmarkDot.title = 'Zenith Onta';
      wordmarkDot.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        dotClicks++;
        clearTimeout(dotClickTimer);
        dotClickTimer = setTimeout(() => { dotClicks = 0; }, 900);
        if (dotClicks >= 3) {
          dotClicks = 0;
          openCuratorModal();
          showToast('⚡ Curator mode activated');
        }
      });
    }

    // Export button -> copies clean JS to clipboard
    const exportBtn = $('[data-curator-export]');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const jsCode = `// Zenith's Portfolio Data — Video Shelf Cuts (Exported ${new Date().toLocaleDateString()})\nconst PORTFOLIO_ITEMS = ${JSON.stringify(items, null, 2)};\n`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(jsCode).then(() => {
            showToast('✅ Copied! You can paste this directly into data.js');
          }).catch(() => {
            promptCopyFallback(jsCode);
          });
        } else {
          promptCopyFallback(jsCode);
        }
      });
    }

    // Reset button -> clears deleted IDs and resets to DEFAULT_ITEMS
    const resetBtn = $('[data-curator-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        clearDeletedIds();
        items = DEFAULT_ITEMS.slice();
        saveItems();
        renderAll();
        renderCuratorList();
        showToast('Restored all cuts from data.js');
      });
    }

    // Exit / Hide badge button
    const exitBtn = $('[data-curator-exit]');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        setCuratorEnabled(false);
        closeModals();
        showToast('Curator mode hidden. Press Shift + M to reopen anytime.');
      });
    }
  }

  function promptCopyFallback(code) {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('✅ Code copied to clipboard!');
    } catch (e) {
      prompt('Copy the shelf code below:', code);
    }
    document.body.removeChild(ta);
  }

  // ── Toast Notification ────────────────────────────────────
  function showToast(msg) {
    const toast = $('[data-toast]');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
