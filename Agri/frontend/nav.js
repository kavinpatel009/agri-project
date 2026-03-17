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
        const mainLinks = [
            { href: 'index.html',        label: '🏠 Home' },
            { href: 'Seeds.html',        label: '🌱 Seeds' },
            { href: 'Feritlizer.html',   label: '🧪 Fertilizers' },
            { href: 'mandi.html',        label: '📊 Mandi' },
            { href: 'weather.html',      label: '🌤️ Weather' },
            { href: 'news.html',         label: '📰 News' },
        ];
        const moreLinks = [
            { href: 'tools.html',        label: '🚜 Implements' },
            { href: 'farmingtypes.html', label: '🌾 Farming' },
            { href: 'weather-rain.html', label: '🌧️ Rain & Tools' },
        ];

        const liItems = mainLinks.map(l => {
            const isActive = cur === l.href ? 'style="color:var(--primary)!important;background:rgba(76,175,80,0.1);border-radius:6px;"' : '';
            return `<li><a href="${l.href}" class="shared-nav-link" ${isActive}>${l.label}</a></li>`;
        }).join('');

        // Check if current page is in moreLinks
        const moreActive = moreLinks.some(l => l.href === cur);
        const moreItems = moreLinks.map(l => {
            const isActive = cur === l.href ? 'style="color:var(--primary);background:rgba(76,175,80,0.08);"' : '';
            return `<a href="${l.href}" class="shared-more-item" ${isActive}>${l.label}</a>`;
        }).join('');

        return `
        <header id="sharedHeader">
            <nav id="sharedNav">
                <a href="index.html" class="shared-logo">
                    <img src="images/logoss.jpg" height="36" width="36" alt="Logo">
                    <span>Agri-Verse</span>
                </a>
                <ul id="sharedNavLinks">
                    ${liItems}
                    <li class="shared-more-wrap">
                        <button class="shared-more-btn ${moreActive?'more-active':''}" onclick="toggleSharedMore(event)">More ▾</button>
                        <div class="shared-more-menu" id="sharedMoreMenu">
                            ${moreItems}
                        </div>
                    </li>
                </ul>
                <div class="shared-nav-right">
                    <button class="shared-back-btn" onclick="history.back()" title="Go Back">← Back</button>
                    <div id="sharedAuthBtn"></div>
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
            gap: 0;
            margin: 0;
            padding: 0;
            flex: 1;
            justify-content: center;
            overflow: visible;
        }
        .shared-nav-link {
            text-decoration: none;
            color: var(--nav-text) !important;
            font-weight: 500;
            font-size: 0.78rem;
            padding: 5px 7px;
            border-radius: 6px;
            transition: all 0.2s;
            white-space: nowrap;
            font-family: 'Poppins', sans-serif;
        }
        .shared-nav-link:hover {
            color: var(--primary) !important;
            background: rgba(76,175,80,0.1);
        }
        /* More dropdown */
        .shared-more-wrap { position: relative; list-style: none; }
        .shared-more-btn {
            background: rgba(76,175,80,0.1);
            border: 1px solid rgba(76,175,80,0.25);
            color: var(--primary);
            padding: 5px 11px;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .shared-more-btn:hover, .shared-more-btn.more-active { background: var(--primary); color: white; }
        .shared-more-menu {
            display: none;
            position: absolute;
            top: 40px; right: 0;
            background: var(--nav-bg);
            border: 1px solid var(--nav-border);
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
            padding: 6px;
            min-width: 170px;
            z-index: 9999;
        }
        .shared-more-menu.open { display: block; }
        .shared-more-item {
            display: block;
            padding: 9px 12px;
            border-radius: 8px;
            text-decoration: none;
            color: var(--nav-text);
            font-size: 0.86rem;
            font-weight: 500;
            transition: background 0.2s;
            white-space: nowrap;
        }
        .shared-more-item:hover { background: rgba(76,175,80,0.08); color: var(--primary) !important; }
        .shared-nav-right {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        .shared-back-btn {
            background: transparent;
            border: 1.5px solid var(--nav-border);
            color: var(--nav-text);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            transition: all 0.2s;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .shared-back-btn:hover {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        @media (max-width: 600px) {
            .shared-back-btn { display: none; }
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

        /* ===== AUTH BUTTON ===== */
        .nav-login-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--primary);
            color: white !important;
            padding: 7px 16px;
            border-radius: 25px;
            font-size: 0.83rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s;
            white-space: nowrap;
            font-family: 'Poppins', sans-serif;
            box-shadow: 0 3px 10px rgba(76,175,80,0.3);
        }
        .nav-login-btn:hover {
            background: #388E3C;
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(76,175,80,0.4);
        }
        .nav-profile-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            background: rgba(76,175,80,0.12);
            border: 1.5px solid rgba(76,175,80,0.3);
            color: var(--primary) !important;
            padding: 6px 14px 6px 7px;
            border-radius: 25px;
            font-size: 0.83rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
            font-family: 'Poppins', sans-serif;
            position: relative;
        }
        .nav-profile-btn:hover { background: rgba(76,175,80,0.2); }
        .nav-avatar {
            width: 26px; height: 26px;
            background: linear-gradient(135deg, #1b4332, #4CAF50);
            color: white;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.78rem; font-weight: 700;
        }
        /* Profile dropdown */
        .nav-profile-wrap { position: relative; }
        .nav-profile-menu {
            display: none;
            position: absolute;
            top: 44px; right: 0;
            background: var(--nav-bg);
            border: 1px solid var(--nav-border);
            border-radius: 14px;
            box-shadow: 0 10px 35px rgba(0,0,0,0.15);
            padding: 8px;
            min-width: 200px;
            z-index: 9999;
        }
        .nav-profile-menu.open { display: block; }
        .nav-profile-header {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px 12px;
            border-bottom: 1px solid var(--nav-border);
            margin-bottom: 6px;
        }
        .nav-avatar-lg {
            width: 38px; height: 38px;
            background: linear-gradient(135deg,#1b4332,#4CAF50);
            color: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 1rem; font-weight: 700; flex-shrink: 0;
        }
        .nav-profile-name { font-weight:700; font-size:0.9rem; color:var(--nav-text); }
        .nav-profile-email { font-size:0.75rem; color:#888; margin-top:1px; }
        .nav-menu-item {
            display: flex; align-items: center; gap: 9px;
            padding: 9px 12px; border-radius: 9px;
            text-decoration: none; color: var(--nav-text);
            font-size: 0.86rem; font-weight: 500;
            transition: background 0.2s; cursor: pointer;
            font-family: 'Poppins', sans-serif;
            border: none; background: none; width: 100%; text-align: left;
        }
        .nav-menu-item:hover { background: rgba(76,175,80,0.08); color: var(--primary); }
        .nav-menu-item.logout { color: #e53e3e !important; }
        .nav-menu-item.logout:hover { background: rgba(229,62,62,0.08) !important; }
        .nav-menu-divider { height:1px; background:var(--nav-border); margin:5px 0; }

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
            .nav-profile-menu { right: -10px; }
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

    window.toggleSharedMore = function(e) {
        e.stopPropagation();
        const m = document.getElementById('sharedMoreMenu');
        if (m) m.classList.toggle('open');
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

        // ===== AUTH BUTTON =====
        const authEl = document.getElementById('sharedAuthBtn');
        if (!authEl) return;

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (isLoggedIn) {
            const name = user.name || 'User';
            const firstName = name.split(' ')[0];
            const initial = firstName.charAt(0).toUpperCase();
            const email = user.email || '';

            authEl.innerHTML = `
                <div class="nav-profile-wrap" id="navProfileWrap">
                    <button class="nav-profile-btn" onclick="toggleNavProfile()">
                        <div class="nav-avatar">${initial}</div>
                        <span>${firstName}</span>
                        <span style="font-size:0.7rem;opacity:0.7;">▾</span>
                    </button>
                    <div class="nav-profile-menu" id="navProfileMenu">
                        <div class="nav-profile-header">
                            <div class="nav-avatar-lg">${initial}</div>
                            <div>
                                <div class="nav-profile-name">${name}</div>
                                <div class="nav-profile-email">${email}</div>
                            </div>
                        </div>
                        <a href="index.html" class="nav-menu-item">🏠 Home</a>
                        <a href="index.html#contact" class="nav-menu-item">📩 Contact</a>
                        <a href="#about" class="nav-menu-item">ℹ️ About</a>
                        <div class="nav-menu-divider"></div>
                        <button class="nav-menu-item logout" onclick="navLogout()">🚪 Logout</button>
                    </div>
                </div>`;
        } else {
            authEl.innerHTML = `
                <a href="login.html" class="nav-login-btn">
                    👤 Login
                </a>`;
        }

        // Close profile menu on outside click
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#navProfileWrap')) {
                const m = document.getElementById('navProfileMenu');
                if (m) m.classList.remove('open');
            }
        });
    });

    window.toggleNavProfile = function() {
        const m = document.getElementById('navProfileMenu');
        if (m) m.classList.toggle('open');
    };

    window.navLogout = function() {
        ['token','user','isLoggedIn'].forEach(k => localStorage.removeItem(k));
        sessionStorage.clear();
        window.location.href = 'login.html';
    };
