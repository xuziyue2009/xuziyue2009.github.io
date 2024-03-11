function isprime(num){
    if (num % 2 == 0 && num != 2){
        return false;
    }
    for (var i = 3; i*i <= num ; i+=2){
        if (num % i == 0){
            return false;
        }
    }
    return true;
}