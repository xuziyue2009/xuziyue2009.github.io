/**
 * components.js — Shared UI component injector for xzy's website
 * Auto-generates navigation, header, footer, and <head> boilerplate on every page.
 * Load BEFORE script.js so #search / .theme-toggle / #date / #time exist.
 */
(function () {
    'use strict';

    /* ---- Flat SVG icons (hand-coded, no emoji) ---- */

    // 24x24 viewBox flat icons, using currentColor for theme adaptability
    var ICON = {
        sun:        '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="7" x2="12" y2="3"/><line x1="15.54" y1="8.46" x2="18.36" y2="5.64"/><line x1="17" y1="12" x2="21" y2="12"/><line x1="15.54" y1="15.54" x2="18.36" y2="18.36"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8.46" y1="15.54" x2="5.64" y2="18.36"/><line x1="7" y1="12" x2="3" y2="12"/><line x1="8.46" y1="8.46" x2="5.64" y2="5.64"/></g></svg>',
        moon:       '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M20 12.5A7.5 7.5 0 1 1 11.5 5a5.5 5.5 0 0 0 8.5 7.5z" fill="currentColor"/></svg>',
        halfMoon:   '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2a10 10 0 0 0 0 20V2z" fill="currentColor"/></svg>',
        celebrate:  '<svg viewBox="0 0 24 24" width="22" height="22"><polygon points="12,2 14.2,8.5 21,9.5 15.5,14 17,21 12,17.5 7,21 8.5,14 3,9.5 9.8,8.5" fill="#FFB300" stroke="#E65100" stroke-width="1.2" stroke-linejoin="round"/></svg>',
        warning:    '<svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,2 2,21 22,21" fill="#F9A825" stroke="#E65100" stroke-width="1.5" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="14" stroke="#333" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="17.5" r="1.2" fill="#333"/></svg>',
        chart:      '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="2" y="13" width="5" height="9" rx="1" fill="currentColor" opacity=".45"/><rect x="9.5" y="7" width="5" height="15" rx="1" fill="currentColor" opacity=".7"/><rect x="17" y="3" width="5" height="19" rx="1" fill="currentColor"/></svg>',
        clipboard:  '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="5" y="2" width="14" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8.5" y="1" width="7" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="8" y1="17" x2="12" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        xmark:      '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
        check:      '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" fill="#4CAF50"/><polyline points="7,12.5 10.5,16 17,9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        cross:      '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" fill="#E74856"/><line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>',
        mouse:      '<svg viewBox="0 0 24 24" width="40" height="40"><rect x="7" y="1" width="10" height="22" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="5" x2="12" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        exclaim:    '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="4" x2="12" y2="15" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="20" r="1.5" fill="currentColor"/></svg>',
        info:       '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="6" r="1.5" fill="currentColor"/><line x1="12" y1="10" x2="12" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
        link:       '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M10 14a4 4 0 0 0 5.5-.5l2-2a4 4 0 0 0-5.5-5.5L10.5 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 10a4 4 0 0 0-5.5.5l-2 2a4 4 0 0 0 5.5 5.5L13.5 16.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };

    // Expose to other scripts
    window.__siteIcons = ICON;

    var NAV_LINKS = [
        { href: '/',              label: '首页', key: 'home'  },
        { href: '/tools/',       label: '工具', key: 'tools' },
        { href: '/games/',       label: '游戏', key: 'games' },
        { href: '/blogs/',       label: '博客', key: 'blogs' },
        { href: '/files/',       label: '文件', key: 'files' }
    ];

    /* ---- helpers ---- */

    function detectActive() {
        var p = window.location.pathname;
        if (p === '/' || (/\/index\.html$/.test(p) && !/\/[^/]+\/index\.html$/.test(p))) return 'home';
        if (/\/tools\//.test(p))  return 'tools';
        if (/\/games\//.test(p))  return 'games';
        if (/\/blogs\//.test(p))  return 'blogs';
        if (/\/files\//.test(p))  return 'files';
        return '';
    }

    function isHome() { return detectActive() === 'home'; }

    function pageTitle() {
        var t = (document.title || '').replace(/\s*[-–|]\s*xzy.*$/i, '').trim();
        return t || 'xzy的网站';
    }

    /* ---- <head> injection ---- */

    function injectHead() {
        // Inject common <head> elements so every page doesn't need to copy them.
        // Skips any element whose selector already exists in <head>.
        var head = document.head || document.getElementsByTagName('head')[0];
        if (!head) return;

        var existing = {};
        head.querySelectorAll('meta,link').forEach(function (el) {
            if (el.name)      existing['meta:' + el.name] = true;
            if (el.property)  existing['meta:' + el.property] = true;
            if (el.charset)   existing['meta:charset'] = true;
            if (el.rel === 'stylesheet' && el.href === '/style.css') existing['link:style'] = true;
            if (el.rel === 'shortcut icon') existing['link:favicon'] = true;
        });

        // Prepend charset meta (must be first in <head>)
        if (!existing['meta:charset']) {
            var charsetMeta = document.createElement('meta');
            charsetMeta.setAttribute('charset', 'utf-8');
            head.insertBefore(charsetMeta, head.firstChild);
        }

        // Viewport
        if (!document.querySelector('meta[name="viewport"]')) {
            var vp = document.createElement('meta');
            vp.name = 'viewport';
            vp.content = 'width=device-width, initial-scale=1';
            head.appendChild(vp);
        }

        // Favicon
        if (!existing['link:favicon']) {
            var fav = document.createElement('link');
            fav.rel = 'shortcut icon';
            fav.href = '/favicon.ico';
            head.appendChild(fav);
        }

        // Stylesheet
        if (!existing['link:style']) {
            var css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = '/style.css?v=20260805';
            head.appendChild(css);
        }

        // OG tags — derive from existing <title> and <meta name="description">
        // We use setTimeout(0) so existing <title>/<meta> are already parsed
        setTimeout(function () {
            var desc = (document.querySelector('meta[name="description"]') || {}).content || '';
            var title = document.title || 'xzy的网站';

            if (!document.querySelector('meta[property="og:title"]')) {
                var ogt = document.createElement('meta');
                ogt.setAttribute('property', 'og:title');
                ogt.content = title;
                head.appendChild(ogt);
            }
            if (!document.querySelector('meta[property="og:description"]')) {
                var ogd = document.createElement('meta');
                ogd.setAttribute('property', 'og:description');
                ogd.content = desc;
                head.appendChild(ogd);
            }
            if (!document.querySelector('meta[property="og:type"]')) {
                var ogty = document.createElement('meta');
                ogty.setAttribute('property', 'og:type');
                ogty.content = 'website';
                head.appendChild(ogty);
            }
        }, 0);
    }

    /* ---- renderers ---- */

    function renderNav(active) {
        var el = document.getElementById('site-nav');
        if (!el) return;
        var html = '<div class="topnav">';

        html += '<div class="topnav-links">';
        NAV_LINKS.forEach(function (l) {
            var cls = l.key === active ? ' class="active"' : '';
            var label = l.key === 'home'
                ? '<img src="/media/logo.png" alt="" width="26" height="26" class="nav-home-icon">' + l.label
                : l.label;
            html += '<a href="' + l.href + '"' + cls + '>' + label + '</a>';
        });
        html += '</div>';

        // Embed search, theme, clock tools in nav bar
        html += '<div class="topnav-tools">';
        if (!isHome()) {
            html += '<input type="text" id="search" placeholder="搜索...">';
        }
        html += '<button class="theme-toggle" title="切换深色/浅色主题">' + ICON.halfMoon + '</button>';
        if (!isHome()) {
            html += '<span id="time" class="topnav-clock"></span>';
        }
        html += '</div>';
        html += '</div>';
        el.innerHTML = html;
    }

    function renderHeader() {
        var el = document.getElementById('site-header');
        if (!el) return;
        if (isHome()) {
            // Full header for homepage
            el.innerHTML =
                '<div class="header">' +
                '<img src="/media/logo.png" alt="logo" width="48" height="48">' +
                '<h1>' + pageTitle() + '</h1>' +
                '<input type="text" id="search" placeholder="搜索本站内容...">' +
                '<div id="date">now_date</div>' +
                '<div id="time">now_time</div>' +
                '</div>';
        } else {
            // Slim title bar for sub-pages
            el.innerHTML =
                '<div class="header subheader">' +
                '<h1>' + pageTitle() + '</h1>' +
                '</div>';
        }
    }

    function renderFooter() {
        var el = document.getElementById('site-footer');
        if (!el) return;
        el.innerHTML = '<div class="footer">-xzy的网站-</div>';
    }

    /* ---- entry ---- */

    injectHead();

    var active = detectActive();
    renderNav(active);
    renderHeader();
    renderFooter();

    // Register Service Worker for PWA offline support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }
})();
