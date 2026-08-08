/**
 * script.js — Global behaviours for xzy's website
 * Clock, theme toggle, client-side search.
 * Load AFTER components.js so #search / .theme-toggle / #date / #time exist.
 */
(function () {
    'use strict';

    var SEARCH_INDEX_PATH = '/searchIndex.json';
    var THEME_STORAGE_KEY = 'xzy-site-theme';

    /* ================================================================
     * Clock
     * ================================================================ */

    var DAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    function updateClock() {
        var now  = new Date();
        var hh   = pad(now.getHours());
        var mm   = pad(now.getMinutes());
        var ss   = pad(now.getSeconds());
        var date = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
        var day  = DAYS[now.getDay()] || '-';

        setText('date', date + ' ' + day);
        setText('time', hh + ':' + mm + ':' + ss);

        setTimeout(updateClock, 1000);
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function setText(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    /* ================================================================
     * Theme
     * ================================================================ */

    function initializeTheme() {
        var saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark') {
            document.body.classList.add('dark');
        } else if (saved === 'light') {
            document.body.classList.remove('dark');
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark');
        }
    }

    function setTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark');
            localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem(THEME_STORAGE_KEY, 'light');
        }
        updateThemeButtons();
    }

    function updateThemeButtons() {
        var buttons = document.querySelectorAll('.theme-toggle');
        var isDark = document.body.classList.contains('dark');
        var icons = window.__siteIcons || {};
        var sunSvg = icons.sun || '☀️';
        var moonSvg = icons.moon || '🌙';
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].innerHTML = isDark ? sunSvg : moonSvg;
            buttons[i].title = isDark ? '切换到浅色主题' : '切换到深色主题';
        }
    }

    function setupThemeToggle() {
        var buttons = document.querySelectorAll('.theme-toggle');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function () {
                setTheme(!document.body.classList.contains('dark'));
            });
        }
        updateThemeButtons();
    }

    /* ================================================================
     * Search
     * ================================================================ */

    function loadSearchIndex(cb) {
        if (window.__siteSearchIndex) {
            cb && cb(window.__siteSearchIndex);
            return;
        }
        fetch(SEARCH_INDEX_PATH)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                window.__siteSearchIndex = data;
                cb && cb(data);
            })
            .catch(function (err) {
                console.error('Failed to load search index:', err);
                cb && cb([]);
            });
    }

    function getQueryParam(name) {
        return (new URLSearchParams(window.location.search)).get(name) || '';
    }

    function isSearchPage() {
        var p = window.location.pathname;
        return /\/search\.html/.test(p) || p === '/search' || p === '/search/';
    }

    function searchSite(query) {
        var q = query.trim();
        if (!q) {
            if (isSearchPage()) renderSearchResults([], q);
            return;
        }
        // Navigate to search page — index will load lazily there
        window.location.href = '/search.html?q=' + encodeURIComponent(q);
    }

    function setupSearch() {
        var input = document.getElementById('search');
        if (!input) return;
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchSite(input.value);
            }
        });

        // Restore query on search page
        var q = getQueryParam('q');
        if (q && input) {
            input.value = decodeURIComponent(q);
        }
    }

    /* ---- scoring & rendering (only used on search page) ---- */

    function normalize(s) { return (s || '').toLowerCase(); }

    function escapeHTML(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeRegExp(v) { return v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    function highlightText(text, terms) {
        if (!text || !terms.length) return escapeHTML(text);
        var esc = escapeHTML(text);
        var re  = new RegExp('(' + terms.map(escapeRegExp).join('|') + ')', 'gi');
        return esc.replace(re, '<span class="highlight">$1</span>');
    }

    function scoreMatch(item, terms) {
        var title = normalize(item.title || '');
        var desc  = normalize(item.description || '');
        var tags  = normalize((item.tags || []).join(' '));
        var url   = normalize(item.url || '');
        var score = 0;

        terms.forEach(function (t) {
            if (title === t)               score += 120;
            else if (title.indexOf(t) === 0) score += 60;
            else if (title.indexOf(t) !== -1) score += 40;
            if (desc.indexOf(t) !== -1)     score += 20;
            if (tags.indexOf(t) !== -1)     score += 30;
            if (url.indexOf(t) !== -1)      score += 10;
        });
        return score;
    }

    function findMatches(query) {
        var terms = normalize(query).split(/\s+/).filter(Boolean);
        if (!terms.length || !window.__siteSearchIndex) return [];

        return window.__siteSearchIndex
            .map(function (item) {
                var content = normalize(item.title + ' ' + item.description + ' ' + (item.tags || []).join(' '));
                var ok = terms.every(function (t) { return content.indexOf(t) !== -1; });
                return ok ? { item: item, score: scoreMatch(item, terms) } : null;
            })
            .filter(Boolean)
            .sort(function (a, b) { return b.score - a.score; })
            .map(function (e) { return e.item; });
    }

    function renderSearchResults(results, query) {
        var container = document.getElementById('search-results');
        if (!container) return;
        container.innerHTML = '';

        var info = document.createElement('div');
        info.className = 'search-summary';

        if (!query) {
            info.textContent = '请输入关键词开始搜索。';
            container.appendChild(info);
            return;
        }
        if (!results.length) {
            info.textContent = '未找到匹配项："' + query + '"';
            container.appendChild(info);
            var hint = document.createElement('p');
            hint.className = 'search-summary';
            hint.textContent = '请尝试更宽泛的关键词，例如"工具"、"游戏"、"博客"等。';
            container.appendChild(hint);
            return;
        }

        info.textContent = '找到 ' + results.length + ' 条结果："' + query + '"';
        container.appendChild(info);

        var terms = normalize(query).split(/\s+/).filter(Boolean);
        results.forEach(function (item) {
            var card  = document.createElement('div');
            card.className = 'card';
            card.style.marginTop = '0';

            var title = document.createElement('h2');
            var link  = document.createElement('a');
            link.href = item.url;
            link.innerHTML = highlightText(item.title || '', terms);
            title.appendChild(link);

            var desc = document.createElement('p');
            desc.innerHTML = highlightText(item.description || '', terms);

            var path = document.createElement('p');
            path.className = 'search-path';
            path.textContent = item.url.replace(/^\//, '');

            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(path);
            container.appendChild(card);
        });
    }

    /* ================================================================
     * Bootstrap
     * ================================================================ */

    function initSite() {
        initializeTheme();
        setupSearch();
        setupThemeToggle();

        // If we're on the search page with a query, render results
        var q = getQueryParam('q');
        if (isSearchPage() && q) {
            loadSearchIndex(function () {
                renderSearchResults(findMatches(q), decodeURIComponent(q));
            });
        }
    }

    /* ---- wire up ---- */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSite);
    } else {
        initSite();
    }

    if (document.readyState === 'complete') {
        updateClock();
    } else {
        window.addEventListener('load', updateClock);
    }
})();
