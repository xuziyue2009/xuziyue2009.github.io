/**
 * components.js — Shared UI component injector for xzy's website
 * Auto-generates navigation, header, and footer on every page.
 * Load BEFORE script.js so #search / #theme-toggle / #date / #time exist.
 */
(function () {
    'use strict';

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

        // Compact mode: embed search, theme, clock inside nav bar
        if (!isHome()) {
            html += '<div class="topnav-tools">';
            html += '<input type="text" id="search" placeholder="搜索...">';
            html += '<button id="theme-toggle">切换主题</button>';
            html += '<span id="time" class="topnav-clock"></span>';
            html += '</div>';
        }
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
                '<button id="theme-toggle">切换主题</button>' +
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

    var active = detectActive();
    renderNav(active);
    renderHeader();
    renderFooter();
})();
