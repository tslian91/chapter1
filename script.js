
const urlParams = new URLSearchParams(window.location.search);
const level = parseInt(urlParams.get('level')) || 1;

const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const messageDisplay = document.getElementById("message");
const board = document.getElementById("game-board");
const toggleSoundBtn = document.getElementById("toggle-sound");

const matchSound = document.getElementById("match-sound");
const wrongSound = document.getElementById("wrong-sound");
const winSound = document.getElementById("win-sound");

let soundEnabled = true;
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let timer = 60;
let timerInterval;

const allLevels = {
  1: [
    { id: '1', img: 'assets/img1.png', word: '人' },
    { id: '2', img: 'assets/img2.png', word: '有' },
    { id: '3', img: 'assets/img3.png', word: '头' },
    { id: '4', img: 'assets/img4.png', word: '也' },
    { id: '5', img: 'assets/img5.png', word: '手' }
  ],
  2: [
    { id: '6', img: 'assets/img6.png', word: '还' },
    { id: '7', img: 'assets/img7.png', word: '口' },
    { id: '8', img: 'assets/img8.png', word: '面' },
    { id: '9', img: 'assets/img9.png', word: '和' },
    { id: '10', img: 'assets/img10.png', word: '心' }
  ]
};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    window.speechSynthesis.speak(utter);
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timer = 60;
  timerDisplay.innerText = `倒计时：${timer} 秒`;
  timerInterval = setInterval(() => {
    timer--;
    timerDisplay.innerText = `倒计时：${timer} 秒`;
    if (timer <= 0) {
      clearInterval(timerInterval);
      messageDisplay.innerText = "⏰ 时间到了！游戏结束。";
      setTimeout(() => {
        updateHighScore();
        window.location.href = "index.html";
      }, 3000);
    }
  }, 1000);
}

function updateHighScore() {
  const currentHigh = parseInt(localStorage.getItem("flipcard_highscore") || "0");
  if (score > currentHigh) {
    localStorage.setItem("flipcard_highscore", score);
  }
}

function loadLevel() {
  levelDisplay.innerText = `第 ${level} 关`;
  const data = allLevels[level];
  let cards = [];

  data.forEach(item => {
    cards.push({ id: item.id, type: 'img', content: `<img src="${item.img}">` });
    cards.push({ id: item.id, type: 'word', content: item.word });
  });

  board.innerHTML = "";
  shuffle(cards).forEach(cardData => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = cardData.id;
    card.dataset.type = cardData.type;

    const inner = document.createElement("div");
    inner.className = "card-inner";

    const front = document.createElement("div");
    front.className = "card-front";
    front.innerHTML = cardData.content;

    const back = document.createElement("div");
    back.className = "card-back";
    back.innerText = "?";

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    board.appendChild(card);

    card.addEventListener("click", () => {
      if (card.classList.contains("flipped") || flippedCards.length === 2) return;

      card.classList.add("flipped");
      flippedCards.push(card);

      if (card.dataset.type === "word") {
        speak(front.innerText);
      }

      if (flippedCards.length === 2) {
        const [card1, card2] = flippedCards;
        if (card1.dataset.id === card2.dataset.id &&
            card1.dataset.type !== card2.dataset.type) {
          if (soundEnabled) matchSound.play();
          matchedPairs++;
          score++;
          scoreDisplay.innerText = `得分：${score}`;
          flippedCards = [];

          if (matchedPairs === data.length) {
            if (soundEnabled) winSound.play();
            clearInterval(timerInterval);
            messageDisplay.innerText = "🎉 本关完成！即将返回首页...";
            updateHighScore();
            setTimeout(() => {
              window.location.href = "index.html";
            }, 3000);
          }
        } else {
          if (soundEnabled) wrongSound.play();
          setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            flippedCards = [];
          }, 800);
        }
      }
    });
  });

  startTimer();
}

toggleSoundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  toggleSoundBtn.innerText = soundEnabled ? "🔊 音效开" : "🔇 音效关";
});

window.onload = () => {
  loadLevel();
};
