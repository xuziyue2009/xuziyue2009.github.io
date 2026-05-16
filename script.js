const SEARCH_INDEX_PATH = '/searchIndex.json';
const THEME_STORAGE_KEY = 'xzy-site-theme';

function updateClock() {
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var day = now.getDay();

    hour = (hour < 10 ? '0' : '') + hour;
    minute = (minute < 10 ? '0' : '') + minute;
    second = (second < 10 ? '0' : '') + second;

    switch (day) {
        case 1:
            day = '星期一';
            break;
        case 2:
            day = '星期二';
            break;
        case 3:
            day = '星期三';
            break;
        case 4:
            day = '星期四';
            break;
        case 5:
            day = '星期五';
            break;
        case 6:
            day = '星期六';
            break;
        case 0:
            day = '星期日';
            break;
        default:
            day = '-';
    }

    var time = hour + ':' + minute + ':' + second;
    var fulldate = year + '/' + month + '/' + date + ' ' + day;

    var dateEl = document.getElementById('date');
    var timeEl = document.getElementById('time');

    if (dateEl) dateEl.innerHTML = fulldate;
    if (timeEl) timeEl.innerHTML = time;

    setTimeout(updateClock, 1000);
}

function initializeTheme() {
    var savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    } else if (savedTheme === 'light') {
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
}

function loadSearchIndex(callback) {
    if (window.siteSearchIndex) {
        callback && callback(window.siteSearchIndex);
        return;
    }

    fetch(SEARCH_INDEX_PATH)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            window.siteSearchIndex = data;
            callback && callback(data);
        })
        .catch(function(error) {
            console.error('Failed to load search index:', error);
            callback && callback([]);
        });
}

function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

function isSearchPage() {
    return window.location.pathname.endsWith('/search.html') || window.location.pathname === '/search' || window.location.pathname === '/search/';
}

function searchSite(query) {
    var trimmed = query.trim();
    if (!trimmed) {
        if (isSearchPage()) {
            renderSearchResults([], trimmed);
        }
        return;
    }

    if (window.siteSearchIndex) {
        window.location.href = '/search.html?q=' + encodeURIComponent(trimmed);
    } else {
        loadSearchIndex(function() {
            window.location.href = '/search.html?q=' + encodeURIComponent(trimmed);
        });
    }
}

function normalize(text) {
    return (text || '').toLowerCase();
}

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, terms) {
    if (!text || !terms.length) {
        return escapeHTML(text);
    }

    var escaped = escapeHTML(text);
    var pattern = new RegExp('(' + terms.map(escapeRegExp).join('|') + ')', 'gi');
    return escaped.replace(pattern, '<span class="highlight">$1</span>');
}

function scoreMatch(item, terms) {
    var title = normalize(item.title || '');
    var description = normalize(item.description || '');
    var tags = normalize((item.tags || []).join(' '));
    var url = normalize(item.url || '');
    var score = 0;

    terms.forEach(function(term) {
        if (title === term) {
            score += 120;
        } else if (title.indexOf(term) === 0) {
            score += 60;
        } else if (title.indexOf(term) !== -1) {
            score += 40;
        }

        if (description.indexOf(term) !== -1) {
            score += 20;
        }

        if (tags.indexOf(term) !== -1) {
            score += 30;
        }

        if (url.indexOf(term) !== -1) {
            score += 10;
        }
    });

    return score;
}

function findMatches(query) {
    var terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length || !window.siteSearchIndex) return [];

    return window.siteSearchIndex
        .map(function(item) {
            var content = normalize(item.title + ' ' + item.description + ' ' + (item.tags || []).join(' '));
            var matchesAll = terms.every(function(term) {
                return content.indexOf(term) !== -1;
            });
            return matchesAll ? { item: item, score: scoreMatch(item, terms) } : null;
        })
        .filter(Boolean)
        .sort(function(a, b) {
            return b.score - a.score;
        })
        .map(function(entry) {
            return entry.item;
        });
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

        var suggestion = document.createElement('p');
        suggestion.className = 'search-summary';
        suggestion.textContent = '请尝试更宽泛的关键词，例如“工具”、“游戏”、“博客”等。';
        container.appendChild(suggestion);
        return;
    }

    info.textContent = '找到 ' + results.length + ' 条结果："' + query + '"';
    container.appendChild(info);

    var terms = normalize(query).split(/\s+/).filter(Boolean);

    results.forEach(function(item) {
        var resultCard = document.createElement('div');
        resultCard.className = 'card';
        resultCard.style.marginTop = '0';

        var title = document.createElement('h2');
        var link = document.createElement('a');
        link.href = item.url;
        link.innerHTML = highlightText(item.title || '', terms);
        title.appendChild(link);

        var desc = document.createElement('p');
        desc.innerHTML = highlightText(item.description || '', terms);

        var path = document.createElement('p');
        path.className = 'search-path';
        path.textContent = item.url.replace(/^\//, '');

        resultCard.appendChild(title);
        resultCard.appendChild(desc);
        resultCard.appendChild(path);
        container.appendChild(resultCard);
    });
}

function setupSearch() {
    var searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                searchSite(searchInput.value);
            }
        });
    }

    var query = getQueryParam('q');
    if (query && searchInput) {
        searchInput.value = decodeURIComponent(query);
    }
}

function setupThemeToggle() {
    var themeButton = document.getElementById('theme-toggle');
    if (!themeButton) return;

    themeButton.addEventListener('click', function() {
        var useDark = !document.body.classList.contains('dark');
        setTheme(useDark);
    });
}

function initPage() {
    initializeTheme();
    setupSearch();
    setupThemeToggle();

    var query = getQueryParam('q');
    if (isSearchPage() && query) {
        loadSearchIndex(function() {
            renderSearchResults(findMatches(query), decodeURIComponent(query || ''));
        });
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

if (document.readyState === 'complete') {
    updateClock();
} else {
    window.addEventListener('load', updateClock);
}
