window.addEventListener('load', () => {
  const game = new Game();
  game.initGame();
  window.game = game;

  // ABCD - x axis
  // 1234 - y axis
  // level - 1234
});
class Game {
  constructor() {
    this.board = document.querySelector('.board');
    this.currBallContainer = null;
    this.currStick = null;
    this.currStickContainer = null;
    this.sticks = null;

    this.players = {
      'white': { className: 'white', wins: WINS},
      'black': { className: 'black', wins: WINS}
    };
  }

  addBall = () => {
    // create new ball
    const newBall = document.createElement('li');
    
    // get ball id
    const currStickNum = this.currStick.getAttribute('id');
    const newBallNum = Math.abs(0 - this.currBallContainer.children.length);
    const newBallId = `${currStickNum}-${newBallNum}`;
    newBall.setAttribute('id', newBallId);
    this.addClass({ el: newBall, className: 'ball' });
    this.addClass({ el: newBall, className: this.players[this.currPlayer].className });

    // add ball to stick
    this.currBallContainer.prepend(newBall);
    
    // remove that spot from winning rows
    this.players[this.currPlayer].wins = this.players[this.currPlayer].wins.map(win => (
      win.filter(spot => spot !== newBallId)
    ));

    this.handleTurnOver();
  };

  addClass = ({ el, className }) => {
    el.classList.add(className)
  }

  checkWin = () => {
    const empty = this.players[this.currPlayer].wins.find(win => !win.length)
    return empty && !empty.length;
  }

  changePlayer = () => {
    this.currPlayer = this.currPlayer === 'white' ? 'black' : 'white';
  }

  createBoard = () => {
    let x = 0;
    let y = 0;

    for (let i = 0; i < 16; i++) {
      if (x === 4) {
        x = 0;
        y += 1;
      }

      const figure = document.createElement('figure');
      this.addClass({ el: figure, className: 'stick-container' });
      this.addClass({ el: figure, className: `stick-container-${i}` });

      const stick = document.createElement('stick');
      this.addClass({ el: stick, className: 'stick' });
      stick.setAttribute('id', `${x}${y}`);
      figure.appendChild(stick);

      const ballContainer = document.createElement('ul');
      this.addClass({ el: ballContainer, className: 'ball-container' });
      figure.appendChild(ballContainer);

      this.board.appendChild(figure);
      x += 1
    }
    this.sticks = document.querySelectorAll('.stick');
  }

  gameOver = () => {
    this.sticks.forEach(stick => {
      stick.removeEventListener('mouseover', this.onStickMouseOver);
      stick.removeEventListener('mouseout', this.onStickMouseOut);
      stick.removeEventListener('click', this.onStickClick)
    })
  }

  handleTurnOver = () => {
    if (this.checkWin()) {
      this.status === 'won'
      this.gameOver()
    } else {
      this.changePlayer()
    }
  }

  initGame = () => {
    this.createBoard();
    this.sticks.forEach(stick => {
      stick.addEventListener('mouseover', this.onStickMouseOver);
      stick.addEventListener('mouseout', this.onStickMouseOut);
      stick.addEventListener('click', this.onStickClick);
    });

    this.currPlayer = 'white';
    window.addEventListener('keydown', this.tilt);
  }
  
  onStickClick = (e) => {
    const currBallContainer = [...this.currStickContainer.children].find(child => (
      child.classList.contains('ball-container')
    ));

    if (currBallContainer.children.length !== 4) {
      this.addBall()
    }
  }

  setCurrItems = (el) => {
    this.currStick = el ? el : null;
    this.currStickContainer = el ? el.parentElement : null;
    this.currBallContainer = el ? [...el.parentElement.children].find(child => (
      child.classList.contains('ball-container')
    )) : null;
  }

  onStickMouseOver = (e) => {
    this.setCurrItems(e.target);
    this.addClass({ el: e.target, className: "hover"});
  };

  onStickMouseOut = (e) => {
    this.setCurrItems();
    this.removeClass({ el: e.target, className: "hover"});
  }

  removeClass = ({ el, className }) => {
    el.classList.remove(className)
  }

  tilt = (e) => {
    const { max, addValue, isTiltable, useX } = TILTS[e.which.toString()];
    const stage = document.querySelector('.stage');
    const currPerspectiveOrigin = window.getComputedStyle(stage).perspectiveOrigin;
    let [x, y] = currPerspectiveOrigin.split(' ').map(value => parseFloat(value));

    if (isTiltable({ value: useX ? x : y, max })) {
      x = useX ? x + addValue : x;
      y = useX ? y : y + addValue;
    }

    stage.style['perspectiveOrigin'] = `${x}px ${y}px`
  }
}
