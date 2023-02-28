
const rootElement=document.querySelector('#cards');

const View = (() => {

    const Symbols = ['./resources/spare.png',
                    './resources/heart.png',
                    './resources/diamonds.png',
                    './resources/club.png'];

    
    function getCardElement (index) {

        const num=1+index%13;
        const symbol=Symbols[Math.floor(index/13)];

        const em = document.createElement('div');

        em.classList.add('card','card-back-side');
        em.setAttribute('data-index',index);

        return em;
    }

    function flipCard (...ems) {

        for (let em of ems) {

            if(em.matches('.card-back-side')){

                const index=em.dataset.index;
                const num=1+index%13;
                const symbol=Symbols[Math.floor(index/13)];            
    
                em.classList.remove('card-back-side');
                em.classList.add('card-front-side');
    
                em.innerHTML=`<p>${transformNumber(num)}</p>
                <img src="${symbol}" alt="">
                <p>${transformNumber(num)}</p>`;
    
            }else{
    
                em.classList.remove('card-front-side');
                em.classList.add('card-back-side');
    
                em.innerHTML='';
            }
        }
    }

    function transformNumber (number) {

        switch (number) {
            case 1:
                return 'A';
            case 11:
                return 'J';
            case 12:
                return 'Q';
                break;
            case 13:
                return 'K';                       
            default:
                return number.toString();
        }
    }

    function pairCard (...cards) {

        cards.forEach((card)=>card.classList.add('card-paired'));
    }

    function appendWrongAnimation (...cards) {

        cards.forEach((card) => {
            card.classList.add('card-wrong');
            card.addEventListener('animationend', (event) => {
                event.target.classList.remove('card-wrong');
            }, {once: true})
        })
    }

    function renderScore(score){

        document.querySelector('.scoreboard').textContent = `Score: ${score}`; 
    }

    function renderTriedTimes(times){

        document.querySelector('.timesboard').textContent = `You've tried: ${times} times `; 
    }

    function showGameFinished () {

        const div = document.createElement('div');
        div.classList.add('completed');

        div.innerHTML=`<p>Game Complete!</p>
        <p>score: ${Model.score}</p>
        <p>You've tried: ${Model.triedTimes} times</p>`

        document.querySelector('#header').before(div);
    }

    function displayCards (arr) {

        arr.forEach((value)=>{
            const em = getCardElement(value);
            rootElement.appendChild(em);
        })
    }

    return {displayCards, flipCard, pairCard, appendWrongAnimation, renderScore, renderTriedTimes, showGameFinished};
})();

const Model = (() => {

    // const revealedCards = [];
    // const score=0;
    // const triedTimes=0;

    function isRevealedCardsMatched() {

        //此函式中的'this'絕對不可省略, 取到的是回傳物件的property('revealedCards'),不是Model中的variable('revealedCards');
        if (this.revealedCards.length !== 2) {
            return false;
        }

        // console.log(this.revealedCards[0], this.revealedCards[1]);

        return (this.revealedCards[0].dataset.index % 13 === 
            this.revealedCards[1].dataset.index % 13);
    }

    return {revealedCards: [], score: 0, triedTimes: 0, isRevealedCardsMatched}

})();

const Controller = (() => {

    const GAME_STATE = Object.freeze({
        FirstCardAwaits: 'FirstCardAwaits',
        SecondCardAwits: 'SecondCardAwaits',
        CardsMatchFailed:'CardsMatchFailed',
        CardMatched:'CardMatched',
        GameFinished:'GameFinished',
    });

    let currentState=GAME_STATE.FirstCardAwaits;
    
    function generateCards () {

        View.displayCards(Utility.getRandomNumberArray(52));
    }

    function dispatchCardAction (card) {

        if (!card.matches('.card-back-side')) {

            return;
        }

        switch (currentState) {
            case GAME_STATE.FirstCardAwaits:
                View.flipCard(card);
                Model.revealedCards.push(card);
                currentState = GAME_STATE.SecondCardAwaits;

                break;
            case GAME_STATE.SecondCardAwaits:
                View.flipCard(card);
                Model.revealedCards.push(card);
                Model.triedTimes += 1;
                View.renderTriedTimes(Model.triedTimes);

                if (Model.isRevealedCardsMatched()) {
                    currentState = GAME_STATE.CardMatched;

                    View.pairCard(...Model.revealedCards);

                    Model.revealedCards = [];
                    Model.score +=10;
                    View.renderScore(Model.score);

                    if (Model.score === 260) {

                        currentState = GAME_STATE.GameFinished;
                        View.showGameFinished();
                        return;
                    } 

                    currentState = GAME_STATE.FirstCardAwaits;

                } else {
                    currentState = GAME_STATE.CardsMatchFailed;

                    View.appendWrongAnimation(...Model.revealedCards);
                    setTimeout(resetCards, 1000);
                }
                
                break;
            default:
                break;
        }
    }

    function resetCards () {
        View.flipCard(...Model.revealedCards);
                        
        Model.revealedCards = [];
        currentState = GAME_STATE.FirstCardAwaits;
    }

    return {generateCards, dispatchCardAction};

})();

const Utility = (()=>{

    function getRandomNumberArray (count) {

        const arr=Array.from(Array(count).keys());

        for (let i = arr.length-1 ; i > 0 ; i--){
            let j = Math.floor(Math.random()*(i+1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        return arr;
    }

    return {getRandomNumberArray};
})();


Controller.generateCards();

rootElement.addEventListener('click',(event)=>{

    if (event.target.matches('.card')){
        Controller.dispatchCardAction(event.target);
    }else if (event.target.matches('.card *')){
        Controller.dispatchCardAction(event.target.parentElement);
    }
})