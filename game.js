const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload,
    create,
    resize
  }
};

const game = new Phaser.Game(config);

let gridConfig = {
  cols: 5,
  rows: 4,
  padding: 20
};

function preload() {
  for (let i = 1; i <= 10; i++) {
    this.load.image(`image${i}`, `assets/${i}.jpg`);
  }
  this.load.image('back', 'assets/back.jpg');
  this.load.audio('match', 'assets/sound_match.mp3');
  this.load.audio('nomatch', 'assets/sound_nomatch.mp3');
}

function create() {
  this.cards = [];
  this.firstCard = null;
  this.secondCard = null;
  this.lockBoard = false;

  const images = [];
  for (let i = 1; i <= 10; i++) {
    images.push(`image${i}`, `image${i}`);
  }

  Phaser.Utils.Array.Shuffle(images);
  this.shuffledImages = images;

  // Attach drawGrid to the scene so we can call it as this.drawGrid()
  this.drawGrid = () => {
    const { cols, rows, padding } = gridConfig;
    const totalPaddingX = padding * (cols - 1);
    const totalPaddingY = padding * (rows - 1);
    const availableWidth = this.scale.width - totalPaddingX;
    const availableHeight = this.scale.height - totalPaddingY;
    const cardSize = Math.floor(Math.min(availableWidth / cols, availableHeight / rows));

    const startX = (this.scale.width - (cols * cardSize + (cols - 1) * padding)) / 2;
    const startY = (this.scale.height - (rows * cardSize + (rows - 1) * padding)) / 2;

    this.shuffledImages.forEach((key, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardSize + padding) + cardSize / 2;
      const y = startY + row * (cardSize + padding) + cardSize / 2;

      const card = this.add.image(x, y, 'back')
        .setDisplaySize(cardSize, cardSize)
        .setOrigin(0.5) 
        .setInteractive();

      card.setData('key', key);
      card.setData('flipped', false);

      card.on('pointerdown', () => onCardClicked.call(this, card));

      this.cards.push(card);
    });
  };

  this.drawGrid(); // Now works!
}

function resize() {
  this.scene.restart(); // Force re-layout on resize
}


function onCardClicked(card) {
  if (this.lockBoard || card.getData('flipped')) return;

  const { cols, rows, padding } = gridConfig;
  const totalPaddingX = padding * (cols - 1);
  const totalPaddingY = padding * (rows - 1);
  const availableWidth = this.scale.width - totalPaddingX;
  const availableHeight = this.scale.height - totalPaddingY;
  const cardSize = Math.floor(Math.min(availableWidth / cols, availableHeight / rows));

  // Flip to front image and resize
  card.setTexture(card.getData('key')).setDisplaySize(cardSize, cardSize);
  card.setData('flipped', true);

  if (!this.firstCard) {
    this.firstCard = card;
  } else {
    this.secondCard = card;
    this.lockBoard = true;

    const first = this.firstCard;
    const second = this.secondCard;

    if (first.getData('key') === second.getData('key')) {
      this.sound.play('match');

      // Animate match (e.g. scale down and fade)
      this.tweens.add({
    targets: [first, second],
    tint: 0x66ff66, // Softer green
    tintFill: true, // Allows blending
    duration: 300,  // Slightly longer to feel smoother
    yoyo: true,
    repeat: 2,
    ease: 'Sine.easeInOut',

        onComplete: () => {



          this.tweens.add({
        targets: [first, second],
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        angle: 180,
        duration: 500,
        ease: 'Power1',
        onComplete: () => {

          

          first.destroy();
          second.destroy();
          this.firstCard = this.secondCard = null;
          this.lockBoard = false;
        }
      });
        }
      });
    } else {
      this.sound.play('nomatch');

      this.time.delayedCall(1500, () => {
        first.setTexture('back').setDisplaySize(cardSize, cardSize).setData('flipped', false);
        second.setTexture('back').setDisplaySize(cardSize, cardSize).setData('flipped', false);
        this.firstCard = this.secondCard = null;
        this.lockBoard = false;
      });
    }
  }
}
