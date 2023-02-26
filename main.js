
const View = (() => {

    const Symbols = ['./resources/spare.png',
                    './resources/heart.png',
                    './resources/diamonds.png',
                    './resources/club.png'];

    const rootElement=document.querySelector('#cards');

    function getCardElement (index) {

        const num=1+index%13;
        const symbol=Symbols[Math.floor(index/13)];

        const em = document.createElement('div');

        em.classList.add('card','card-front-side');
        em.innerHTML=`<p>${transformNumber(num)}</p>
        <img src="${symbol}" alt="">
        <p>${transformNumber(num)}</p>`;

        return em;
    }

    function transformNumber(number){

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

    function displayCards(){

        Array.from(Array(52).keys()).forEach((value,index)=>{

            const em = getCardElement(value);
            rootElement.appendChild(em);
        })
    }

    return {displayCards};
})();


View.displayCards();
