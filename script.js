window.onload = function updateClock(){
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var day = now.getDay();

    hour = (hour < 10 ? "0" : "") + hour;
    minute = (minute < 10 ? "0" : "") + minute;
    second = (second < 10 ? "0" : "") + second;

    switch(day){
        case 1:
            day = "星期一";
            break;
        case 2:
            day = "星期二";
            break;
        case 3:
            day = "星期三";
            break;
        case 4:
            day = "星期四";
            break;
        case 5:
            day = "星期五";
            break;
        case 6:
            day = "星期六";
            break;
        case 0:
            day = "星期日";
            break;
        default:
            day = "-";
    }

    var time = hour + ":" + minute + ":" + second;
    var fulldate = year + "/" + month + "/" + date + " " + day;

    var dateEl = document.getElementById("date");
    var timeEl = document.getElementById("time");

    if (dateEl) dateEl.innerHTML = fulldate;
    if (timeEl) timeEl.innerHTML = time;

    setTimeout(updateClock, 1000);

    // Load search index for search page
    if (isSearchPage() && !window.siteSearchIndex) {
        fetch('/searchIndex.json')
            .then(response => response.json())
            .then(data => {
                window.siteSearchIndex = data;
                var query = getQueryParam('q');
                if (query) {
                    var results = findMatches(query);
                    renderSearchResults(results, query);
                }
            })
            .catch(error => console.error('Failed to load search index:', error));
    }
};

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
        fetch('/searchIndex.json')
            .then(response => response.json())
            .then(data => {
                window.siteSearchIndex = data;
                window.location.href = '/search.html?q=' + encodeURIComponent(trimmed);
            })
            .catch(error => console.error('Failed to load search index:', error));
    }
}

function normalize(text) {
    return (text || '').toLowerCase();
}

function findMatches(query) {
    var terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];

    return siteSearchIndex.filter(function(item) {
        var content = normalize(item.title + ' ' + item.description + ' ' + item.tags.join(' '));
        return terms.every(function(term) {
            return content.indexOf(term) !== -1;
        });
    });
}

function renderSearchResults(results, query) {
    var container = document.getElementById('search-results');
    if (!container) return;

    container.innerHTML = '';

    var info = document.createElement('div');
    info.style.marginBottom = '1rem';
    info.style.color = 'var(--muted)';

    if (!query) {
        info.textContent = '请输入关键词开始搜索。';
        container.appendChild(info);
        return;
    }

    if (!results.length) {
        info.textContent = '未找到匹配项："' + query + '"';
        container.appendChild(info);
        return;
    }

    info.textContent = '找到 ' + results.length + ' 条结果："' + query + '"';
    container.appendChild(info);

    results.forEach(function(item) {
        var resultCard = document.createElement('div');
        resultCard.className = 'card';
        resultCard.style.marginTop = '0';

        var title = document.createElement('h2');
        var link = document.createElement('a');
        link.href = item.url;
        link.textContent = item.title;
        title.appendChild(link);

        var desc = document.createElement('p');
        desc.textContent = item.description;

        var path = document.createElement('p');
        path.style.color = 'var(--muted)';
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

    if (isSearchPage()) {
        renderSearchResults(findMatches(query), decodeURIComponent(query || ''));
    }
}

function setupThemeToggle() {
    var themeButton = document.getElementById('theme-toggle');
    if (!themeButton) return;

    themeButton.addEventListener('click', function() {
        document.body.classList.toggle('dark');
    });
}

setupSearch();
setupThemeToggle();
