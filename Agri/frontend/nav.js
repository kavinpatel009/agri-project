// ===== AGRI-VERSE SHARED NAV + DARK MODE =====
// Include this in ALL pages: <script src="nav.js"></script>

(function() {

    // ===== 1. DARK MODE =====
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const btn = document.getElementById('darkToggle');
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Apply saved theme immediately on load
    const savedTheme = localStorage.getItem('agri-theme') || 'light';
    applyTheme(savedTheme);

    // Global toggleDark function - works on ALL pages
    window.toggleDark = function() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('agri-theme', newTheme);
    };

    // ===== 2. INJECT SHARED HEADER =====
    function getCurrentPage() {
        const path = window.location.pathname;
        const file = path.split('/').pop() || 'index.html';
        return file;
    }

    function getNavHTML() {
        const cur = getCurrentPage();
        const links = [
            { href: 'index.html',        label: '🏠 Home' },
            { href: 'Seeds.html',        label: '🌱 Seeds' },
            { href: 'Feritlizer.html',   label: '🧪 Fertilizers' },
            { href: 'mandi.html',        label: '📊 Mandi' },
            { href: 'weather.html',      label: '🌤️ Weather' },
            { href: 'news.html',         label: '📰 News' },
            { href: 'tools.html',        label: '🚜 Implements' },
            { href: 'farmingtypes.html', label: '🌾 Farming' },
            { href: 'weather-rain.html', label: '🌧️ Rain' },
        ];

        const liItems = links.map(l => {
            const isActive = cur === l.href ? 'style="color:var(--primary)!important;background:rgba(76,175,80,0.1);border-radius:6px;"' : '';
            return `<li><a href="${l.href}" class="shared-nav-link" ${isActive}>${l.label}</a></li>`;
        }).join('');

        return `
        <header id="sharedHeader">
            <nav id="sharedNav">
                <a href="index.html" class="shared-logo">
                    <img src="images/logoss.jpg" height="38" width="38" alt="Logo">
                    <span>Agri-Verse</span>
                </a>
                <ul id="sharedNavLinks">${liItems}</ul>
                <div class="shared-nav-right">
                    <button id="darkToggle" onclick="toggleDark()" title="Dark/Light Mode">🌙</button>
                    <button id="sharedHamburger" onclick="toggleMobileNav()">☰</button>
                </div>
            </nav>
        </header>`;
    }

    function injectStyles() {
        const css = `
        /* ===== SHARED NAV STYLES ===== */
        :root {
            --primary: #4CAF50;
            --primary-dark: #388E3C;
            --nav-bg: #ffffff;
            --nav-text: #333333;
            --nav-border: #e8f5e9;
            --bg: #f9f9f9;
            --card-bg: #ffffff;
            --text: #212121;
            --gray: #666;
            --border: #e0e0e0;
            --shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        [data-theme="dark"] {
            --nav-bg: #1a2535;
            --nav-text: #e8f5e9;
            --nav-border: #2d3e50;
            --bg: #0f1923;
            --card-bg: #1a2535;
            --text: #e8f5e9;
            --gray: #b0bec5;
            --border: #2d3e50;
            --shadow: 0 4px 20px rgba(0,0,0,0.4);
            --dark: #e8f5e9;
            --light: #1e2d3d;
            --primary-dark: #81c784;
        }

        /* ===== GLOBAL DARK MODE — BODY + ALL CONTENT ===== */
        [data-theme="dark"] body {
            background-color: #0f1923 !important;
            color: #e8f5e9 !important;
        }
        [data-theme="dark"] body * {
            transition: background-color 0.3s, color 0.3s, border-color 0.3s;
        }
        /* Cards / Sections */
        [data-theme="dark"] .seed-card,
        [data-theme="dark"] .service-card,
        [data-theme="dark"] .tool-card,
        [data-theme="dark"] .fertilizer-card,
        [data-theme="dark"] .farming-card,
        [data-theme="dark"] .card,
        [data-theme="dark"] .detail,
        [data-theme="dark"] .forecast-item,
        [data-theme="dark"] article,
        [data-theme="dark"] .news-card,
        [data-theme="dark"] .article-card,
        [data-theme="dark"] .weather-card,
        [data-theme="dark"] .container,
        [data-theme="dark"] .tool-item {
            background-color: #1a2535 !important;
            border-color: #2d3e50 !important;
            color: #e8f5e9 !important;
        }
        /* Text colors */
        [data-theme="dark"] h1,
        [data-theme="dark"] h2,
        [data-theme="dark"] h3,
        [data-theme="dark"] h4,
        [data-theme="dark"] h5,
        [data-theme="dark"] p,
        [data-theme="dark"] span,
        [data-theme="dark"] li,
        [data-theme="dark"] td,
        [data-theme="dark"] th,
        [data-theme="dark"] label {
            color: #e8f5e9 !important;
        }
        /* Keep green headings green */
        [data-theme="dark"] .section-title h2,
        [data-theme="dark"] .seed-content h3,
        [data-theme="dark"] .tool-content h3,
        [data-theme="dark"] .fertilizer-content h3,
        [data-theme="dark"] .farming-card h3,
        [data-theme="dark"] .detail-label {
            color: #81c784 !important;
        }
        /* Gray text stays muted */
        [data-theme="dark"] .seed-content p,
        [data-theme="dark"] .detail-value,
        [data-theme="dark"] .section-title p,
        [data-theme="dark"] .gray,
        [data-theme="dark"] [class*="gray"] {
            color: #b0bec5 !important;
        }
        /* Inputs / Selects */
        [data-theme="dark"] input,
        [data-theme="dark"] select,
        [data-theme="dark"] textarea {
            background-color: #1e2d3d !important;
            color: #e8f5e9 !important;
            border-color: #2d3e50 !important;
        }
        [data-theme="dark"] input::placeholder { color: #b0bec5 !important; }
        /* Sections / Backgrounds */
        [data-theme="dark"] section,
        [data-theme="dark"] main,
        [data-theme="dark"] .seeds-container,
        [data-theme="dark"] .container,
        [data-theme="dark"] .tools-container,
        [data-theme="dark"] .fertilizer-container,
        [data-theme="dark"] .farming-container,
        [data-theme="dark"] .news-container,
        [data-theme="dark"] .table-wrap,
        [data-theme="dark"] .weather-wrapper {
            background-color: #0f1923 !important;
        }
        /* Table */
        [data-theme="dark"] tbody tr { background-color: #1a2535 !important; border-color: #2d3e50 !important; }
        [data-theme="dark"] tbody tr:hover { background-color: #1e2d3d !important; }
        /* Hero sections — keep dark overlay */
        [data-theme="dark"] .seeds-hero,
        [data-theme="dark"] .hero,
        [data-theme="dark"] .tools-hero,
        [data-theme="dark"] .fertilizer-hero,
        [data-theme="dark"] .farming-hero,
        [data-theme="dark"] .news-hero,
        [data-theme="dark"] .mandi-hero { filter: brightness(0.9); }
        /* Testimonials bg */
        [data-theme="dark"] .testimonials { background-color: #111e2d !important; }
        /* Stats bg */
        [data-theme="dark"] .stats { filter: brightness(0.85); }
        /* Footer stays dark always */
        [data-theme="dark"] footer { background-color: #0a1219 !important; }

        #sharedHeader {
            background: var(--nav-bg);
            border-bottom: 1px solid var(--nav-border);
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            transition: background 0.3s, border-color 0.3s;
        }
        #sharedNav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 3%;
            max-width: 1400px;
            margin: 0 auto;
        }
        .shared-logo {
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            flex-shrink: 0;
        }
        .shared-logo img {
            border-radius: 6px;
            object-fit: cover;
        }
        .shared-logo span {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--primary);
            white-space: nowrap;
            font-family: 'Poppins', sans-serif;
        }
        #sharedNavLinks {
            display: flex;
            list-style: none;
            align-items: center;
            gap: 2px;
            margin: 0;
            padding: 0;
        }
        .shared-nav-link {
            text-decoration: none;
            color: var(--nav-text) !important;
            font-weight: 500;
            font-size: 0.83rem;
            padding: 6px 9px;
            border-radius: 6px;
            transition: all 0.2s;
            white-space: nowrap;
            font-family: 'Poppins', sans-serif;
        }
        .shared-nav-link:hover {
            color: var(--primary) !important;
            background: rgba(76,175,80,0.1);
        }
        .shared-nav-right {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        #darkToggle {
            background: rgba(76,175,80,0.1);
            border: none;
            color: var(--primary);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }
        #darkToggle:hover { background: var(--primary); color: white; }
        #sharedHamburger {
            display: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--primary);
            background: none;
            border: none;
        }
        @media (max-width: 900px) {
            #sharedHamburger { display: flex; align-items: center; justify-content: center; }
            #sharedNavLinks {
                display: none;
                flex-direction: column;
                position: absolute;
                top: 58px;
                left: 0; right: 0;
                background: var(--nav-bg);
                padding: 12px 20px 18px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                z-index: 9999;
                gap: 4px;
            }
            #sharedNavLinks.open { display: flex; }
            #sharedNavLinks li { width: 100%; }
            .shared-nav-link { display: block; padding: 10px 14px; font-size: 0.95rem; }
        }
        `;
        const style = document.createElement('style');
        style.id = 'shared-nav-styles';
        style.textContent = css;
        document.head.insertBefore(style, document.head.firstChild);
    }

    window.toggleMobileNav = function() {
        const ul = document.getElementById('sharedNavLinks');
        if (ul) ul.classList.toggle('open');
    };

    // Close mobile nav on outside click
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#sharedNav')) {
            const ul = document.getElementById('sharedNavLinks');
            if (ul) ul.classList.remove('open');
        }
    });

    // Inject on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        // Remove old headers/navs/back buttons
        document.querySelectorAll('.back-btn').forEach(el => el.remove());

        // Remove existing header if any
        const existingHeader = document.querySelector('header');
        if (existingHeader) existingHeader.remove();

        // Also remove old nav outside header
        const oldNavs = document.querySelectorAll('nav:not(#sharedNav)');
        oldNavs.forEach(n => {
            if (!n.closest('#sharedHeader')) n.remove();
        });

        // Inject styles
        injectStyles();

        // Inject new header at top of body
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = getNavHTML();
        document.body.insertBefore(headerDiv.firstElementChild, document.body.firstChild);

        // Apply current theme to button
        applyTheme(localStorage.getItem('agri-theme') || 'light');
    });

})();
