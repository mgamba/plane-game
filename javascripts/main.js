(function() {
  var canvas  = document.getElementById('game-board');
  var ctx = canvas.getContext('2d');
  var raf;

  var packageImage = new Image();
  packageImage.src = './images/gold-money-parachute.png';

  var planeImage = new Image();
  planeImage.src = './images/static-plane.png';

  var plane = new Plane(150, 0);
  var package = new Package(0, 0);

  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlane();
    drawPackage();
  }

  function drawPlane() {
    plane.draw();
  }

  function drawPackage() {
    package.draw();
  }

  function Plane(x, y) {
    this.x = x;
    this.y = y;
    this.w = 110;
    this.h = 60;
    this.image = planeImage;
    this.draw = function() {
      ctx.drawImage(this.image, this.x, Math.min(this.y, canvas.height - this.h), this.w, this.h);
    };
    this.contains = function(pos) {
      var l = this.x;
      var r = this.x + this.w;
      var t = this.y - this.h;
      var b = this.y;
      return (pos.x > l && pos.x < r && pos.y > t && pos.y < b);
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
    this.isActive = false;
    this.image = packageImage;
    this.draw = function() {
      if (this.isActive) {
        ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
        this.x += 1;
        this.y += 2;
      }
    }
    this.contains = function(pos) {
      var l = this.x;
      var r = this.x + this.w;
      var t = this.y - this.h;
      var b = this.y;
      return (pos.x > l && pos.x < r && pos.y > t && pos.y < b);
    }
    this.deploy = function(deployFrom) {
      if (this.isActive != true) {
        this.isActive = true;
        this.x = deployFrom.x - (this.w / 2);
        this.y = deployFrom.y;
      }
    }
  };

  function endGame() {
    setTimeout(function() {
      ctx.textAlign = "center";
      ctx.font = "bold 38pt Arial";
      ctx.fillText("Nice Flyin' Ace!", canvas.width * 0.5, canvas.height * 0.25);
    }, 1000);
  }

  function mousemoveHandler(e) {
    var x = e.offsetX;
    var y = e.offsetY;
    plane.y = y;
    drawBoard();
  }

  function mouseClickHandler(e) {
    console.log('mouseClickHandler');
    package.deploy(plane.deployPoint())
  }

  window.startGame = function(e) {
    document.getElementById('game-board').classList.add('active');

    canvas.addEventListener('mousemove', mousemoveHandler);
    canvas.addEventListener('click', mouseClickHandler);

    var startButton = document.getElementById('start-button');
    startButton.parentNode.removeChild(startButton);
    drawBoard();
  }
})()
