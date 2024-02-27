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
        case 7:
            day = "星期七";
            break;
        default:
            day = "-";
    }

    var time = hour + ":" + minute + ":" + second;
    var fulldate = year + "/"+ month + "/" + date + " " + day;

    document.getElementById("date").innerHTML = fulldate;
    document.getElementById("time").innerHTML = time;

    setTimeout(updateClock, 1000);
}

// updateClock();
