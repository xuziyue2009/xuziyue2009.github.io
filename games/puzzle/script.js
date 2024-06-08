const puzzleSize = 3;    
const puzzleContainer = document.getElementById('puzzle');    
// 创建一个包含1到8的数组    
var numbers = Array.from({ length: puzzleSize * puzzleSize - 1 }, (_, i) => i + 1);    
  
function initPuzzle() {      
      
    // 随机打乱数组（不包括我们稍后手动添加的“空白”格子）    
    numbers.sort(() => 0.5 - Math.random());    
    numbers.push(0);

    refresh();   
} 

function swap(a, b){
    var tmp = numbers[a];
    numbers[a] = numbers[b];
    numbers[b] = tmp;
}

function refresh(){
    puzzleContainer.innerHTML = '';  
    numbers.forEach((num, index) => {    
        const row = Math.floor(index / puzzleSize); // 计算当前格子所在的行    
        const col = index % puzzleSize; // 计算当前格子所在的列    
  
        const tile = document.createElement('div');    
        tile.classList.add('tile');    
        tile.textContent = num.toString(); // 将数字转换为字符串并显示  
        tile.addEventListener('click', onTileClick);    
        puzzleContainer.appendChild(tile);    
    });    
}
  
function onTileClick(event) {  
    const clickedTile = event.target;  
    const clickedTileIndex = Array.from(puzzleContainer.children).indexOf(clickedTile);  
    const clickedTileRow = Math.floor(clickedTileIndex / puzzleSize);  
    const clickedTileCol = clickedTileIndex % puzzleSize;  
  
    console.log('Clicked tile:', clickedTile.textContent, 'Tileindex:', clickedTileIndex, 'at position:', clickedTileRow, clickedTileCol);  
    
    switch (clickedTileIndex){
        case 0:
            if (numbers[1] == 0){
                swap(0,1);
            }
            else if (numbers[3] == 0){
                swap(0,3);
            }
            break;
        case 1:
            if (numbers[0] == 0){
                swap(1,0);
            }
            else if (numbers[2] == 0){
                swap(1,2);
            }
            else if (numbers[4] == 0){
                swap(1,4);
            }
            break;
        case 2:
            if (numbers[1] == 0){
                swap(2,1);
            }
            else if (numbers[5] == 0){
                swap(2,5);
            }
            break;
        case 3:
            if (numbers[0] == 0){
                swap(3,0);
            }
            else if (numbers[4] == 0){
                swap(3,4);
            }
            else if (numbers[6] == 0){
                swap(3,6);
            }
            break;
        case 4:
            if (numbers[1] == 0){
                swap(4,1);
            }
            else if (numbers[3] == 0){
                swap(4,3);
            }
            else if (numbers[5] == 0){
                swap(4,5);
            }
            else if (numbers[7] == 0){
                swap(4,7);
            }
            break;
        case 5:
            if (numbers[2] == 0){
                swap(5,2);
            }
            else if (numbers[4] == 0){
                swap(5,4);
            }
            else if (numbers[8] == 0){
                swap(5,8);
            }
            break;
        case 6:
            if (numbers[3] == 0){
                swap(6,3);
            }
            else if (numbers[7] == 0){
                swap(6,7);
            }
            break;
        case 7:
            if (numbers[6] == 0){
                swap(7,6);
            }
            else if (numbers[4] == 0){
                swap(7,4);
            }
            else if (numbers[8] == 0){
                swap(7,8);
            }
            break;
        case 8:
            if (numbers[5] == 0){
                swap(8,3);
            }
            else if (numbers[7] == 0){
                swap(8,7);
            }
            break;
    }

    refresh();
}  
  
initPuzzle();

