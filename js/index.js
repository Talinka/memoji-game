const rotated = 'card_rotated';
const wrong = 'card_failed';
const right = 'card_right';
const closed = 'card_closed';
const show = 'show';

function Card(cardId, emojiId, element) {
  this.id = cardId;
  this.emojiId = emojiId;
  this.cardElement = element;
  this.backSideElement = element.querySelector('.back');

  this.isClosed = function () {
    return this.cardElement.classList.contains(closed);
  }

  this.isOpened = function () {
    return this.cardElement.classList.contains(rotated);
  }

  this.rotate = function () {
    this.cardElement.classList.toggle(rotated);
    this.cardElement.classList.toggle(closed);
  }

  this.close = function () {
    if (this.isClosed()) {
      return;
    }
    this.rotate();
    this.backSideElement.classList.remove(right);
    this.backSideElement.classList.remove(wrong);
  }

  this.setRight = function () {
    this.backSideElement.classList.add(right);
  }

  this.setWrong = function () {
    this.backSideElement.classList.add(wrong);
  }

  this.setEmoji = function (emojiId) {
    this.backSideElement.classList.remove(`c${this.emojiId + 1}`);
    this.emojiId = emojiId;
    this.backSideElement.classList.add(`c${emojiId + 1}`);
  }
}

function MemoryGame() {
  this.pairCount = 6;
  this.firstCard = null;
  this.secondCard = null;
  this.openedPairCount = 0;
  this.emojiIds = [];
  this.state = 'finished';

  for (let i = 0; i < this.pairCount; i++) {
    this.emojiIds.push(i, i);
  }

  this.cards = [];

  const cardElements = Array.from(document.querySelectorAll('.card'));
  for (let i = 0; i < cardElements.length; i++) {
    const cardElement = cardElements[i];
    cardElement.addEventListener('click', () => {
      if (this.state === 'gaming') {
        this.openCard(i);
      }
    });
    cardElement.addEventListener('animationend', () => {
      if (this.checkWin()) {
        this.showResult(true);
      }
    });
    this.cards.push(new Card(i, this.emojiIds[i], cardElement));
  }

  this.openCard = function (id) {
    const card = this.cards[id];
    if (card.isOpened()) {
      return;
    }
    card.rotate();
    if (!this.firstCard) {
      this.firstCard = card;
    } else if (!this.secondCard) {
      this.secondCard = card;
      this.checkCards();
    } else {
      this.closeWrongCards();
      this.firstCard = card;
      this.secondCard = null;
    }
  }

  this.isPair = function () {
    return this.firstCard && this.secondCard &&
      (this.firstCard.emojiId == this.secondCard.emojiId);
  }

  this.checkWin = function () {
    const result = this.openedPairCount == this.pairCount;
    if (result) {
      this.stop();
      return result;
    }
  }

  this.checkCards = function () {
    if (this.isPair()) {
      this.openedPairCount += 1;
      this.firstCard.setRight();
      this.secondCard.setRight();
    } else {
      this.firstCard.setWrong();
      this.secondCard.setWrong();
    }
  }

  this.closeWrongCards = function () {
    if (!this.isPair()) {
      this.firstCard.close();
      this.secondCard.close();
    }
  }

  this.clear = function () {
    this.stop();
    this.firstCard = null;
    this.secondCard = null;
    this.openedPairCount = 0;
    this.cards.forEach(card => card.close());
  }

  this.stop = function () {
    clearInterval(this.timerId);
    this.state = 'finished';
  }

  this.start = function () {
    shuffle(this.emojiIds);
    this.cards.forEach(card => card.setEmoji(this.emojiIds[card.id]));
    const timerElement = document.getElementById('timer');
    this.state = 'gaming';

    let seconds = 59;
    timerElement.innerText = '01:00';
    this.timerId = setInterval(() => {
      timerElement.innerText = `00:${String(seconds).padStart(2, '0')}`;
      seconds -= 1;
      if (seconds < 0) {
        this.stop();
        this.showResult(false);
      }
    }, 1000);
  }

  this.showResult = function (isWin) {
    const msgElement = document.getElementById('msg');
    msgElement.innerHTML = '';
    const message = isWin ? 'Win' : 'Lose';
    for (let i = 0; i < message.length; i++) {
      const span = document.createElement('span');
      span.innerText = message[i];
      span.classList.add('word');
      span.classList.add(`l${i + 1}`);
      msgElement.appendChild(span);
    }
    document.getElementById('result_window').classList.add(show);
  }
}


function shuffle(array) {
  for (let i = 0; i < array.length; i++)
    array[i] = { x: array[i], r: Math.random() };
  array.sort((a, b) => { return a.r - b.r; });
  for (let i = 0; i < array.length; i++)
    array[i] = array[i].x;
}

function app() {
  const game = new MemoryGame();

  game.start();
  const startButton = document.getElementById('start_button');
  startButton.addEventListener('mousedown', () => startButton.classList.add('clicked'));
  startButton.addEventListener('mouseup', () => {
    startButton.classList.remove('clicked');
    document.getElementById('result_window').classList.remove(show);
    game.clear();
    setTimeout(() => game.start(), 600)
  });
}
