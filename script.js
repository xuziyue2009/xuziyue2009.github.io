function DoubleNum(num){
    if (num < 10){
        return '0' + num;
    }
    else{
        return '' + num;
    }
}

function GetTime(){
    Now = new Date();

    var h = Now.getHours();
    var m = Now.getMinutes();
    var s = Now.getSeconds();

    var Time = DoubleNum(h) + ':' + DoubleNum(m) + ':' + DoubleNum(s);

    document.getElementById("time").innerHTML = Time;
    
    setTimeout(GetTime, 1000);
}

GetTime();
