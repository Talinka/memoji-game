const emoji = ['🐶', '🐰', '🐼', '🐨', '🐯', '🐊'];
const ROTATED = "card_rotated";
const WRONG = "card_failed";
const RIGHT = "card_right";
const CLOSED = "card_closed";
const SHOW = "show";

function Card(id, emojiIndex, element) {
	this.id = id;
	this.emojiIndex = emojiIndex;
	this.domElement = element;
	var backSide = element.querySelector(".back");
	var em = document.createTextNode(emoji[emojiIndex]);
	backSide.appendChild(em);
	this.removeClass = function(class_name) {
		if (this.domElement.classList.contains(class_name))
			this.domElement.classList.remove(class_name);
	}
	this.addClass = function(class_name) {
		if (!this.domElement.classList.contains(class_name))
			this.domElement.classList.add(class_name);
	}
	this.changeEmoji = function(emojiIndex) {
		this.emojiIndex = emojiIndex;
		var backSide = this.domElement.querySelector(".back");
		backSide.innerText = "";
		var em = document.createTextNode(emoji[emojiIndex]);
		backSide.appendChild(em);
	}
}

function Cards() {
	this.firstCard = null;
	this.secondCard = null;
	this.openedCount = 0;	
	this.indexes = [];
	for (var i = 0; i < 6; i++) {
		this.indexes.push(i);
		this.indexes.push(i);
	}
	this.cards = [];
	shuffle(this.indexes);
	this.cardsElement = document.getElementById("cards_id");		
	var cardElements = Array.from(document.querySelectorAll(".card"));
	for (var i=0; i < cardElements.length; i++) {
		var card_element = cardElements[i];		
		this.cards.push(new Card(i, this.indexes[i], card_element));
	}
	
	this.openCard = function(index) {
		var card = this.cards[index];		
		if (card.domElement.classList.contains(ROTATED))
			return;
		card.removeClass(CLOSED);
		card.addClass(ROTATED);		
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
	
	this.isPair = function() {
		return this.firstCard && this.secondCard &&
			(this.firstCard.emojiIndex == this.secondCard.emojiIndex);
	}	
	
	this.checkWin = function() {
		var result = this.openedCount == this.cards.length;
		if (result) {
			stopTimer(this.timerId);
			return result;
		}
	}	
	
	this.checkCards = function () {
		if (this.isPair()) {
			this.openedCount += 2;
			this.firstCard.addClass(RIGHT);
			this.secondCard.addClass(RIGHT);
		} else {
			this.firstCard.addClass(WRONG);
			this.secondCard.addClass(WRONG);
		}
	}
	
	this.closeWrongCards = function() {
		if (!this.isPair()) {
			this.firstCard.addClass(CLOSED);
			this.firstCard.removeClass(ROTATED);
			this.firstCard.removeClass(WRONG);
			this.secondCard.addClass(CLOSED);
			this.secondCard.removeClass(ROTATED);
			this.secondCard.removeClass(WRONG);
		}
	}
	
	this.clear = function() {
		stopTimer(this.timerId);
		this.firstCard = this.secondCard = null;
		this.openedCount = 0;
		shuffle(this.indexes);
		this.cards.forEach( card => {
			card.addClass(CLOSED);
			card.removeClass(ROTATED);
			card.removeClass(RIGHT);
			card.removeClass(WRONG);
			card.changeEmoji(this.indexes[card.id]);
		});
	}
	
	this.start = function() {
		this.timerId = startTimer();
	}
}

function startTimer() {
	var timerElement = document.getElementById("timer");
	var seconds = 59;

	timerElement.innerText = "01:00";
	var timerId = setInterval(stepTimer, 1000);
	return timerId;

	function stepTimer() {
		timerElement.innerText = "00:" + (seconds < 10 ? "0" : "") + seconds;
		seconds -= 1;
		if (seconds < 0) {
			stopTimer(timerId);
			showResult(false);
		}
	}
}

function stopTimer(id) {
	clearInterval(id);
}

function showResult(isWin) {
	var msgElement = document.getElementById("msg");
	// remove all children
	msgElement.innerHTML = "";
	var msg = isWin ? "Win" : "Lose";
	for (var i = 0; i < msg.length; i++) {
		var span = document.createElement("SPAN");
		span.innerText = msg[i];
		span.classList.add("word");
		span.classList.add("l"+(i+1));
		msgElement.appendChild(span);
	}
	document.getElementById("win").classList.add(SHOW);
}

function shuffle(array) {
	for (var i = 0; i < array.length; i++)
		array[i] = { x: array[i], r: Math.random()};
	array.sort((a, b) => { return a.r - b.r; });
	for (var i = 0; i < array.length; i++)
		array[i] = array[i].x;
}

// Main function

function initCards() {
	var deck = new Cards();
	deck.cards.forEach(card => {
		card.domElement.addEventListener("click", function(event) { deck.openCard(card.id); });
		card.domElement.addEventListener("animationend", function(event) { if (deck.checkWin()) showResult(true); });
	});
	deck.start();
	var button = document.getElementById("button");
	button.addEventListener("mousedown", function(event) { button.classList.add("clicked"); });
	button.addEventListener("mouseup", function(event) {
		button.classList.remove("clicked");
		document.getElementById("win").classList.remove(SHOW);
		deck.clear();
		deck.start(); });

}
