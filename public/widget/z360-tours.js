/**
 * Z360 Virtual Tours Widget
 *
 * Usage:
 * 1. Include this script on your page:
 *    <script src="https://z360-virtual-tour.vercel.app/widget/z360-tours.js"></script>
 *
 * 2. Initialize the widget:
 *    Z360Tours.init({ apiUrl: 'https://z360-virtual-tour.vercel.app' });
 *
 * 3. Embed a tour:
 *    <div data-z360-tour="tour-slug"></div>
 *
 * 4. Or use JavaScript:
 *    Z360Tours.embed('tour-slug', document.getElementById('tour-container'));
 *    Z360Tours.loadTour('tour-slug').then(tour => console.log(tour));
 */

(function() {
  'use strict';

  const Z360Tours = {
    config: {
      apiUrl: 'https://z360-virtual-tour.vercel.app',
    },

    /**
     * Initialize the widget with configuration
     */
    init: function(options) {
      if (options) {
        Object.assign(this.config, options);
      }

      // Auto-embed tours with data attributes
      this.autoEmbed();

      // Watch for dynamically added elements
      if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => this.autoEmbed());
        observer.observe(document.body, { childList: true, subtree: true });
      }

      console.log('Z360 Virtual Tours Widget initialized');
    },

    /**
     * Auto-embed tours based on data attributes
     */
    autoEmbed: function() {
      const elements = document.querySelectorAll('[data-z360-tour]:not([data-z360-initialized])');
      elements.forEach(el => {
        const slug = el.getAttribute('data-z360-tour');
        const height = el.getAttribute('data-z360-height') || '600px';
        if (slug) {
          el.setAttribute('data-z360-initialized', 'true');
          this.embed(slug, el, { height });
        }
      });
    },

    /**
     * Embed a tour in a container element
     */
    embed: function(slug, container, options = {}) {
      const height = options.height || '600px';
      const width = options.width || '100%';

      const iframe = document.createElement('iframe');
      iframe.src = `${this.config.apiUrl}/embed/${slug}`;
      iframe.style.width = width;
      iframe.style.height = height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = options.borderRadius || '8px';
      iframe.allowFullscreen = true;
      iframe.allow = 'xr-spatial-tracking; gyroscope; accelerometer';
      iframe.title = options.title || 'Z360 Virtual Tour';

      // Add loading indicator
      container.innerHTML = '';
      container.style.position = 'relative';
      container.style.background = '#0D1B2A';
      container.style.borderRadius = options.borderRadius || '8px';
      container.style.overflow = 'hidden';

      const loader = document.createElement('div');
      loader.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #C9A962; font-family: system-ui, -apple-system, sans-serif;">
          <div style="width: 40px; height: 40px; border: 3px solid rgba(201, 169, 98, 0.3); border-top: 3px solid #C9A962; border-radius: 50%; animation: z360spin 1s linear infinite; margin: 0 auto 15px;"></div>
          <p>Loading Virtual Tour...</p>
        </div>
        <style>@keyframes z360spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      `;
      container.appendChild(loader);

      iframe.onload = function() {
        loader.remove();
      };

      container.appendChild(iframe);

      return iframe;
    },

    /**
     * Load tour data via API
     */
    loadTour: async function(slug) {
      const response = await fetch(`${this.config.apiUrl}/api/public/tours/${slug}`);
      if (!response.ok) {
        throw new Error('Tour not found');
      }
      return response.json();
    },

    /**
     * Load all tours via API
     */
    loadTours: async function(options = {}) {
      const params = new URLSearchParams();
      if (options.category) params.append('category', options.category);
      if (options.featured) params.append('featured', 'true');
      if (options.premium) params.append('premium', 'true');
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const url = `${this.config.apiUrl}/api/public/tours?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load tours');
      }
      return response.json();
    },

    /**
     * Create a tour gallery
     */
    createGallery: async function(container, options = {}) {
      const data = await this.loadTours(options);

      container.innerHTML = '';
      container.style.display = 'grid';
      container.style.gridTemplateColumns = options.columns || 'repeat(auto-fill, minmax(300px, 1fr))';
      container.style.gap = options.gap || '20px';

      data.tours.forEach(tour => {
        const card = document.createElement('div');
        card.style.cssText = `
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        `;

        card.innerHTML = `
          <div style="position: relative; padding-top: 60%;">
            <img src="${tour.coverImage || ''}" alt="${tour.title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
            ${tour.isPremium ? '<span style="position: absolute; top: 10px; right: 10px; background: #C9A962; color: #0D1B2A; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">PREMIUM</span>' : ''}
          </div>
          <div style="padding: 15px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0D1B2A;">${tour.title}</h3>
            ${tour.location ? `<p style="margin: 0; color: #666; font-size: 14px;"><span style="margin-right: 5px;">📍</span>${tour.location}</p>` : ''}
            ${tour.category ? `<p style="margin: 8px 0 0 0; color: #C9A962; font-size: 13px;">${tour.category.name}</p>` : ''}
          </div>
        `;

        card.onmouseover = () => {
          card.style.transform = 'translateY(-5px)';
          card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        };
        card.onmouseout = () => {
          card.style.transform = '';
          card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        };

        card.onclick = () => {
          if (options.onTourClick) {
            options.onTourClick(tour);
          } else {
            window.open(tour.viewUrl, '_blank');
          }
        };

        container.appendChild(card);
      });

      return data;
    },

    /**
     * Open tour in a modal
     */
    openModal: function(slug) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        width: 90%;
        max-width: 1200px;
        height: 80vh;
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: #0D1B2A;
      `;

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        border-radius: 50%;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      `;
      closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
      closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      closeBtn.onclick = () => overlay.remove();

      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
      };

      document.onkeydown = (e) => {
        if (e.key === 'Escape') overlay.remove();
      };

      modal.appendChild(closeBtn);
      this.embed(slug, modal, { height: '100%', borderRadius: '0' });
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      return overlay;
    }
  };

  // Expose globally
  window.Z360Tours = Z360Tours;

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Z360Tours.init());
  } else {
    Z360Tours.init();
  }
})();
