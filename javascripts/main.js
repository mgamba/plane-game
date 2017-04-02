(function() {
  var canvas  = document.getElementById('game-board');
  var ctx = canvas.getContext('2d');
  var raf;
  var gameIsActive = false;
  var coins = 0;

  var packageImage = new Image();
  packageImage.src = './images/gold-money-parachute.png';

  var planeImage = new Image();
  planeImage.src = './images/static-plane.png';

  var plane = new Plane(150, 0);
  var package = new Package(0, 0);
  var bird = new Bird(0, 0);
  var house = new House(0, 0);

  function drawBoard() {
    if (gameIsActive) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      detectCollision();
      drawPlane();
      drawPackage();
      drawBird();
      drawHouse();
      raf = window.requestAnimationFrame(drawBoard);
    }
  }

  function drawPlane() {
    plane.draw();
  }

  function drawPackage() {
    package.draw();
  }

  function drawBird() {
    bird.draw();
  }

  function drawHouse() {
    house.draw();
  }

  function detectCollision() {
    if (overlap(plane.coords(), bird.coords())) {
      bird.hit();
    }

    if (overlap(package.coords(), house.coords())) {
      package.delivered();
    }

    if (overlap(package.coords(), bird.coords())) {
      package.hit();
    }
  }

  function overlap(a, b) {
    return (b.x2 >= a.x1) && (b.x1 <= a.x2) && (b.y2 >= a.y1) && (b.y1 <= a.y2)
  }

  function addPoint() {
    coins++;
  }

  function losePoint() {
    coins && coins--;
  }

  function House(x, y) {
    this.x = x;
    this.y = y;
    this.w = 38;
    this.h = 42;
    this.coords = function() {
      return {
        x1: this.x,
        y1: this.y,
        x2: this.x + this.w,
        y2: this.y + this.h
      }
    }

    var image = new Image();
    image.src = './images/house.png';

    this.isBuilt = false;

    this.draw = function() {
      if (this.isBuilt) {
        this.x -= 1;
        if (this.x + this.w < 0) {
          this.isBuilt = false;
        } else {
          ctx.drawImage(image, this.x, this.y, this.w, this.h);
        }
      } else {
        this.x = canvas.width + this.w;
        this.y = canvas.height - this.h;
        this.isBuilt = true;
      }
    };
  }

  function Bird(x, y) {
    this.x = x;
    this.y = y;
    this.w = 38;
    this.h = 42;
    this.coords = function() {
      return {
        x1: this.x,
        y1: this.y,
        x2: this.x + this.w,
        y2: this.y + this.h
      }
    }

    var images = [];
    var imageCount = 8;
    for (var i=0; i < imageCount; i++) {
      var image = new Image();
      image.src = './images/birds/bird-'+i+'.png';
      images.push(image);
    }
    this.isFlying = false;

    var deadImage = new Image();
    deadImage.src = './images/birds/bird-x.png';
    this.isHit = false;
    this.hit = function() {
      this.isHit = true;
      this.isFlying = false;
    }

    this.draw = function() {
      if (this.isFlying) {
        this.x -= 4;
        if (this.x + this.w < 0) {
          this.isFlying = false;
        } else {
          ctx.drawImage(nextImage(), this.x, this.y, this.w, this.h);
        }
      } else if (this.isHit) {
        ctx.drawImage(deadImage, this.x, this.y, this.w, this.h);
        endGame();
      } else {
        this.x = canvas.width + this.w;
        this.y = Math.random() * canvas.height * 2 / 3;
        this.isFlying = true;
      }
    };

    var spriteIndex = 0;
    var spriteDirection = 1;
    var spriteDrag = 4;
    var spriteDragCount = 0;
    function nextImage() {
      if (!(spriteDragCount++ % spriteDrag)) {
        if (spriteIndex == 0) {
          spriteDirection = 1;
        } else if (spriteIndex >= imageCount - 1) {
          spriteDirection = -1;
        }
        spriteIndex += (spriteDirection);
      }
      return images[spriteIndex];
    }
  }

  function Plane(x, y) {
    this.x = x;
    this.y = y;
    this.coords = function() {
      return {
        x1: this.x,
        y1: this.y,
        x2: this.x + this.w,
        y2: this.y + this.h
      }
    }
    this.w = 110;
    this.h = 60;
    this.image = planeImage;
    this.draw = function() {
      ctx.drawImage(this.image, this.x, Math.min(this.y, canvas.height - this.h), this.w, this.h);
    };
    this.deployPoint = function() {
      return {
        x: this.x + (this.w / 3),
        y: this.y + this.h
      }
    }
  };

  function Package(x, y) {
    this.x = x;
    this.y = y;
    this.w = 50;
    this.h = 70;
    this.coords = function() {
      return {
        x1: this.x,
        y1: this.y,
        x2: this.x + this.w,
        y2: this.y + this.h
      }
    }

    this.delivered = function() {
      if (this.isActive) {
        this.isActive = false;
        addPoint();
      }
    }

    this.hit = function() {
      this.isActive = false;
    }

    this.isActive = false;
    this.image = packageImage;
    this.draw = function() {
      if (this.isActive) {
        if (this.aboveGround()) {
          ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
          this.x += 1;
          this.y += 2;
        } else {
          this.isActive = false;
          losePoint();
        }
      }
    };
    this.aboveGround = function() {
      return this.y + this.h < canvas.height;
    };
    this.deploy = function(deployFrom) {
      if (this.isActive != true) {
        this.isActive = true;
        this.x = deployFrom.x - (this.w / 2);
        this.y = deployFrom.y;
      }
    };
  };

  function endGame() {
    gameIsActive = false;

    setTimeout(function() {
      ctx.textAlign = "center";
      ctx.font = "bold 38pt Arial";
      ctx.fillText("Nice Flyin' Ace!", canvas.width * 0.5, canvas.height * 0.25);
    }, 1000);
  }

  function mousemoveHandler(e) {
    var x = e.offsetX;
    var y = e.offsetY;
    plane.y = Math.min(y, canvas.height - plane.h - package.h - house.h - 50);
  }

  function mouseClickHandler(e) {
    package.deploy(plane.deployPoint())
  }

  window.startGame = function(e) {
    document.getElementById('game-board').classList.add('active');

    canvas.addEventListener('mousemove', mousemoveHandler);
    canvas.addEventListener('click', mouseClickHandler);

    var startButton = document.getElementById('start-button');
    startButton.parentNode.removeChild(startButton);

    gameIsActive = true;
    raf = window.requestAnimationFrame(drawBoard);
  }
})()
