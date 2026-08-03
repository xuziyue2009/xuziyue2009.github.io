'use strict';

const WORD = 'Supercalifragilisticexpialidocious';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
let round = 5;
let answerIndex;
let score = 0;
let hintText;

function create() {
    const variantsDiv = document.getElementById('variants');
    variantsDiv.innerHTML = '';

    answerIndex = Math.floor(Math.random() * round) + 1;
    const changePos = Math.floor(Math.random() * WORD.length);
    const changeChar = LETTERS[Math.floor(Math.random() * 26)];

    for (let i = 1; i <= round; i++) {
        let text = WORD;
        if (i === answerIndex) {
            text = WORD.substring(0, changePos) + changeChar + WORD.substring(changePos + 1);
            hintText = `${text.substring(0, changePos)}<${changeChar}>${text.substring(changePos + 1)}`;
        }

        const num = String(i).padStart(2, '0') + '.';
        const el = document.createElement('p');
        el.textContent = num + text;
        variantsDiv.appendChild(el);
    }

    round++;

    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'numberInput';
    input.placeholder = '请输入一个数字';
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
    document.getElementById('inputans').appendChild(input);

    const btn = document.createElement('button');
    btn.textContent = '检查答案';
    btn.addEventListener('click', checkAnswer);
    document.getElementById('buttonDiv').appendChild(btn);
}

function checkAnswer() {
    const raw = document.getElementById('numberInput').value;
    if (!/^\d+$/.test(raw)) {
        alert('请输入数字！');
        return;
    }

    const num = parseInt(raw, 10);
    if (num === 2236) alert('???');

    if (num === answerIndex) {
        alert(`对\n${hintText}`);
        score++;
    } else {
        alert(`错\n${hintText}`);
        score--;
        round--;
    }

    refreshScore();
    ['variants', 'inputans', 'buttonDiv'].forEach(id => {
        document.getElementById(id).innerHTML = '';
    });
    create();
}

function refreshScore() {
    const el = document.getElementById('points');
    el.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = `分数：${score}`;
    el.appendChild(p);
}

window.addEventListener('load', create);
