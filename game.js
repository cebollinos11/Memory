const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload,
    create
  }
};

const game = new Phaser.Game(config);

function preload() {
  for (let i = 1; i <= 10; i++) {
    this.load.image(`image${i}`, `assets/${i}.jpg`);
  }
  this.load.image('back', 'assets/back.jpg');
}

function create() {
  const images = [];
  for (let i = 1; i <= 10; i++) {
    images.push(`image${i}`, `image${i}`);
  }

  Phaser.Utils.Array.Shuffle(images);

  const grid = {
    cols: 5,
    rows: 4,
    cardSize: 100,
    padding: 20
  };

  const startX = (this.scale.width - (grid.cols * (grid.cardSize + grid.padding) - grid.padding)) / 2;
  const startY = 50;

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;

  images.forEach((key, i) => {
    const col = i % grid.cols;
    const row = Math.floor(i / grid.cols);
    const x = startX + col * (grid.cardSize + grid.padding);
    const y = startY + row * (grid.cardSize + grid.padding);

    const card = this.add.image(x, y, 'back').setDisplaySize(grid.cardSize, grid.cardSize).setInteractive();
    card.setData('key', key);
    card.setData('flipped', false);

    card.on('pointerdown', () => {
      if (lockBoard || card.getData('flipped')) return;

      card.setTexture(card.getData('key'));
      card.setData('flipped', true);

      if (!firstCard) {
        firstCard = card;
      } else {
        secondCard = card;
        lockBoard = true;

        if (firstCard.getData('key') === secondCard.getData('key')) {
          // Match found
          firstCard = secondCard = null;
          lockBoard = false;
        } else {
          // Mismatch
          this.time.delayedCall(1000, () => {
            firstCard.setTexture('back').setData('flipped', false);
            secondCard.setTexture('back').setData('flipped', false);
            firstCard = secondCard = null;
            lockBoard = false;
          });
        }
      }
    });
  });
}
