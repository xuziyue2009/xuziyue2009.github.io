function isprime(num){
    if (num <= 1){
        return false;
    }
    if (num == 2){
        return true;
    }
    if (num % 2 == 0){
        return false;
    }
    for (var i = 3; i*i <= num ; i+=2){
        if (num % i == 0){
            return false;
        }
    }
    return true;
}

function factorize(num) {
    var factors = [];
    
    for (var i = 2; i <= Math.sqrt(num); i++) {
        while (num % i === 0) {
            factors.push(i);
            num /= i;
        }
    }
    
    if (num > 1) {
        factors.push(num);
    }
    
    return factors;
}