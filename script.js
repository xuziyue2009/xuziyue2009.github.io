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
    var fulldate = year + "/"+ month + "/" + date + " " + day;

    var dateEl = document.getElementById("date");
    var timeEl = document.getElementById("time");

    if (dateEl) dateEl.innerHTML = fulldate;
    if (timeEl) timeEl.innerHTML = time;

    setTimeout(updateClock, 1000);
}

function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
}

function searchSite(query) {
    if (!query) return;
    var target = '/tools/index.html?q=' + encodeURIComponent(query.trim());
    window.location.href = target;
}

function setupSearch() {
    var searchInput = document.getElementById('search');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            searchSite(searchInput.value);
        }
    });

    var query = getQueryParam('q');
    if (query) {
        searchInput.value = decodeURIComponent(query);
        if (window.location.pathname.endsWith('/tools/index.html') || window.location.pathname === '/tools/') {
            applyToolsSearch(query);
        }
    }
}

function applyToolsSearch(query) {
    var keyword = query.trim().toLowerCase();
    if (!keyword) return;

    var cards = document.querySelectorAll('.card');
    var matches = 0;

    cards.forEach(function(card) {
        var text = card.textContent.toLowerCase();
        var visible = keyword.split(/\s+/).every(function(term) {
            return term && text.indexOf(term) !== -1;
        });

        card.style.display = visible ? '' : 'none';
        if (visible) matches++;
    });

    var searchMessage = document.getElementById('search-message');
    if (!searchMessage) {
        searchMessage = document.createElement('div');
        searchMessage.id = 'search-message';
        searchMessage.style.marginTop = '1rem';
        searchMessage.style.color = 'var(--muted)';
        var header = document.querySelector('.header');
        if (header) header.appendChild(searchMessage);
    }

    searchMessage.textContent = matches > 0 ? '找到 ' + matches + ' 个结果' : '未找到匹配项';
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
