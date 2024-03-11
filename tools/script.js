function test(n){
    var flag=0;
    for(var i=2;i<=n;i++){
    if(n%i==0){
    flag++;
    if(flag==1){
    alert(n+"="+i);
    }else{
    alert("×"+i);
    }
    n=n/i;
    i--;
    }
    }
    if(flag==0){
    alert(n+"为质数");
    }else{
    alert("共有"+flag+"个质因数");
    }
    }