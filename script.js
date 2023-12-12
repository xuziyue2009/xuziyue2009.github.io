function updateClock(){
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    hour = (hour < 10 ? "0" : "") + hour;
    minute = (minute < 10 ? "0" : "") + minute;
    second = (second < 10 ? "0" : "") + second;

    var time = hour + ":" + minute + ":" + second;
    document.getElementById("time").innerHTML = time;

    setTimeout(updateClock, 1000);
}

updateClock();
