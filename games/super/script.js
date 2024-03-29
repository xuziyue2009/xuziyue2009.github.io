var l = 5;  
var randomNum;
var points = 0;
const word = "Supercalifragilisticexpialidocious";  
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']; 

window.onload = function load(){
    create();
}
  
function create() {  
    var variantsDiv = document.getElementById('variants'); // 获取容纳变体的 div 元素  
    variantsDiv.innerHTML = ''; // 清空 div 的内容，以便添加新的变体  
  
    randomNum = Math.floor(Math.random() * l) + 1;  
    var randomPlace = Math.floor(Math.random() * word.length); // 注意这里使用 word.length 而不是硬编码的 34  
    var randomLetter = Math.floor(Math.random() * 26);  

    console.log(randomNum);
  
    for (var i = 1; i <= 5 * l; i++) {  
        var output = word;  
        if (i === randomNum) {  
            output = output.substring(0, randomPlace) + letters[randomLetter] + output.substring(randomPlace + 1);  
        }  
  
        // 创建新的 p 元素  
        var pElement = document.createElement('p');  
        // 设置 p 元素的内容  
        pElement.textContent = output;  
        // 将 p 元素添加到 div 中  
        variantsDiv.appendChild(pElement);  
    }  
  
    l += 1;  

    var input = document.createElement('input'); // 创建一个新的<input>元素  
    input.type = 'number'; // 设置类型为number  
    input.id = 'numberInput'; // 设置id为numberInput  
    input.placeholder = '请输入一个数字'; // 设置占位符

    var inputDiv = document.getElementById('inputans');
    inputDiv.appendChild(input);

    // 添加按钮  
    var checkButton = document.createElement('button');  
    checkButton.textContent = '检查答案'; // 设置按钮文本  
    checkButton.onclick = checkNumber; // 设置按钮点击事件处理程序  
  
    // 获取包含按钮的 div 元素  
    var buttonDiv = document.getElementById('buttonDiv');  
  
    // 将按钮添加到 div 中  
    buttonDiv.appendChild(checkButton); 
}

function checkNumber() {  
    var inputValue = document.getElementById("numberInput").value;  
    var isNumber = /^\d+$/.test(inputValue);  

    if (!isNumber) {  
        alert("请输入数字！");  
        return;  
    }  

    var number = parseInt(inputValue);  

    if (number == 2236){
        alert("???");
    }

    var isAns = number === randomNum;  

    if (isAns) {  
        alert("对");  
        points += 1;  
        var pointsdiv = document.getElementById('points');  
        // 清空 points div 的内容  
        pointsdiv.innerHTML = '';  
          
        // 创建一个新的<p>元素来显示分数  
        var pointsoutput = document.createElement('p');  
        pointsoutput.textContent = "分数：" + points;  
          
        // 将<p>元素添加到'points' div中  
        pointsdiv.appendChild(pointsoutput);  
    }
    else{
        alert("错");
        points -= 1;
        l -= 1;
    }

    var variantsDiv = document.getElementById('variants'); // 获取容纳变体的 div 元素  
    variantsDiv.innerHTML = ''; // 清空 div 的内容，以便添加新的变体  
    variantsDiv = document.getElementById('inputans'); // 获取容纳变体的 div 元素  
    variantsDiv.innerHTML = ''; // 清空 div 的内容，以便添加新的变体  
    variantsDiv = document.getElementById('buttonDiv'); // 获取容纳变体的 div 元素  
    variantsDiv.innerHTML = ''; // 清空 div 的内容，以便添加新的变体  

    create()
}