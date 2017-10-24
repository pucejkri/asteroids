// game.js

import Ship from './ship';
import Asteroid from './asteroid';
import Alien from './alien'

/** @class Game
  * Represents an Asteroids game
  */
export default class Game {
  constructor() {
    this.k = 1;
    this.width = 640;
    this.height = 480;
    this.level = 1;
    this.over = false;
    this.victory = false;
    this.score = 0;
    this.lives = 3;
    this.songPlayed = false;
    this.warpCD = 0;
    this.paused = false;
    this.lvlScreenTimer = 500;
    // Create the back buffer canvas
    this.backBufferCanvas = document.createElement('canvas');
    this.backBufferCanvas.width = this.width;
    this.backBufferCanvas.height = this.height;
    this.backBufferContext = this.backBufferCanvas.getContext('2d');
    // Create the screen buffer canvas
    this.screenBufferCanvas = document.createElement('canvas');
    this.screenBufferCanvas.width = this.width;
    this.screenBufferCanvas.height = this.height;
    document.body.appendChild(this.screenBufferCanvas);
    this.screenBufferContext = this.screenBufferCanvas.getContext('2d');
    // Bind class methods
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.loop = this.loop.bind(this);
    this.loop1 = this.loop1.bind(this);
    this.initGame = this.initGame.bind(this);
    this.reload = this.reload.bind(this);
    this.renderScore = this.renderScore.bind(this);
    this.renderLives = this.renderLives.bind(this);
    this.renderOver = this.renderOver.bind(this);
    window.onkeydown = this.keyDownHandler.bind(this);
    window.onkeyup = this.keyUpHandler.bind(this);

    this.initGame();
  }

  initGame() {
    this.asteroids = [];
    this.asteroidsTmp = [];
    this.alien = null;
    this.levelUp = false;
    this.asteroidCnt = 10 + (this.level-1)*5;
    this.ship = new Ship(this.width/2, this.height/2, 0, this.width, this.height);
    for(var c=0; c < this.asteroidCnt; c++) {
      var clear = false;
      while (!clear) {
        var ast = new Asteroid( Math.random()*this.width,
                                Math.random()*this.height,
                                Math.random()*30 + 20,
                                Math.random()*Math.PI * 2,
                                this.width,
                                this.height
                              );
       clear = this.checkClearSpawn(ast);
      }
      this.asteroids.push(ast);
    }
    this.interval = setInterval(this.loop, 10)
  }

  keyDownHandler(event) {
    event.preventDefault();
    var code = event.keyCode
    if(code === 39) {
      this.ship.setDirection('right');
    }
    else if(code === 37) {
      this.ship.setDirection('left');
    }
    if(code === 38) {
      this.ship.setThrottle(true);
    }
    if(code === 32) {
      this.ship.setFire(true);
    }
    if(code === 87) {
      if(this.warpCD <= 0) {
        this.respawnShip();
        this.warpCD = 1000;
      }
    }
    if(code === 82) {
      this.ship.setFiremode(1)
    }
    if((code === 80 || code === 27) && !this.over) {
      if(this.paused) {
        this.unpause();
      } else {
        this.pause();
      }
    }
  }

  keyUpHandler(event) {
    event.preventDefault();
    var code = event.keyCode
    if(code === 39 || code === 37) {
      this.ship.setDirection('none');
    }
    if(code === 38) {
      this.ship.setThrottle(false);
    }
    if (code === 32) {
      this.ship.setFire(false);
    }
  }

  reload(level, score, lives) {
    this.over = false;
    this.lives = lives;
    this.score = score;
    this.level = level;
    this.initGame();
    this.songPlayed = false;
  }

  pause() {
    clearInterval(this.interval);
    this.paused = true;
    this.render();
  }

  unpause() {
    this.interval = setInterval(this.loop, 10);
    this.paused = false;
  }

  checkClearSpawn(ast) {
    if(ast.getDist(this.ship.getPose().x, this.ship.getPose().y) < (ast.getRadius() + this.ship.getRadius())) {
      return false;
    }
    for(var i = 0 ; i < this.asteroids.length ; i++) {
      var pose = this.asteroids[i].getPose();
      var r = this.asteroids[i].getRadius();
      if( ast.getDist(pose.x, pose.y) < (r + ast.getRadius())) {
        return false;
      }
    }
    return true;
  }


  blowAsteroids() {
    this.asteroids.forEach((ast) => {
      if(ast.getDestroyed()) {
        this.score += 1;
        new Audio('sounds/explosion.wav').play();
        if(ast.getRadius() > 15) {
          var pose = ast.getPose();
          var r = ast.getRadius();
          this.asteroidsTmp.push( new Asteroid( pose.x + r*Math.sin(pose.phi + Math.PI/2),
                                                pose.y - r*Math.cos(pose.phi + Math.PI/2),
                                                r/1.6,
                                                pose.phi + Math.PI/2,
                                                this.width,
                                                this.height
                                              ));

          this.asteroidsTmp.push( new Asteroid( pose.x + r*Math.sin(pose.phi - Math.PI/2),
                                                pose.y - r*Math.cos(pose.phi - Math.PI/2),
                                                r/1.6,
                                                pose.phi - Math.PI/2,
                                                this.width,
                                                this.height
                                              ));
        }
      } else {
        this.asteroidsTmp.push(ast)
      }
    });
    this.asteroids = this.asteroidsTmp;
    this.asteroidsTmp = [];
  }

  impact(ast1, ast2) {
    var m1 = ast1.getMass();
    var m2 = ast2.getMass();
    var pose1 = ast1.getPose();
    var pose2 = ast2.getPose();
    var normal = {
      x: pose1.x - pose2.x,
      y: pose1.y - pose2.y
    }
    var theta = Math.atan2(normal.y, normal.x);
    var dx1 = ast1.getVelocity().dx; //
    var dy1 = ast1.getVelocity().dy; //
    var dx2 = ast2.getVelocity().dx; //
    var dy2 = ast2.getVelocity().dy; //

    var rv1 = this.vecRot(dx1, dy1, theta);
    var rv2 = this.vecRot(dx2, dy2, theta);

    var termx = (m1*rv1.x + m2*rv2.x)/(m1+m2);
    var termy = (m1*rv1.y + m2*rv2.y)/(m1+m2);

    var newrv1 = {
      x: (termx - (m2*this.k*(rv1.x-rv2.x))/(m1+m2)),
      y: (termy - (m2*this.k*(rv1.y-rv2.y))/(m1+m2))
    }

    var newrv2 = {
      x: (termx + (m1*this.k*(rv1.x-rv2.x))/(m1+m2)),
      y: (termy + (m1*this.k*(rv1.y-rv2.y))/(m1+m2))
    }
    var newv1 = this.vecRot(newrv1.x, newrv1.y, -theta);
    var newv2 = this.vecRot(newrv2.x, newrv2.y, -theta);

    if (ast1.impact(newv1.x, newv1.y) && ast2.impact(newv2.x, newv2.y)) {
          new Audio('sounds/crash.wav').play();
    }
  }

  vecRot(x, y, theta) {
    return {x: x*Math.cos(theta) - y*Math.sin(theta), y: x*Math.sin(theta) + y*Math.cos(theta)}
  }

  checkAsteroidCollisions() {
    for(var i = 0 ; i < this.asteroids.length ; i++) {
      if(!this.ship.getInvincible()){
        this.checkShipCrash(this.asteroids[i]);
      }
      var pose = this.asteroids[i].getPose();
      var prevpos = this.asteroids[i].getPrevPos();
      var r = this.asteroids[i].getRadius();
      for(var j = 0 ; j < this.asteroids.length ; j++) {
        var curdist = this.asteroids[j].getDist(pose.x, pose.y);
        var prevdist = this.asteroids[j].getPrevDist(prevpos.x, prevpos.y);
        if(i !== j && curdist < (r + this.asteroids[j].getRadius()) && curdist < prevdist) {
          this.impact(this.asteroids[i], this.asteroids[j]);
        }
      }
    }
  }

  checkShipCrash(ast) {
    var vertices = this.ship.getVerts();
    for ( var i = 0 ; i < vertices.length ; i = i+2) {
      if(ast.getDist(vertices[i], vertices[i+1]) <= ast.getRadius() && !this.over) {
        this.explode();
        return;
      }
    }
  }

  newLevel(){
    if(this.asteroids.length === 0) {
      clearInterval(this.interval);
      this.interval = setInterval(this.loop1, 10);
      this.level += 1;
      this.levelUp = true;
    }

  }

  explode() {
    new Audio('./sounds/ship_explode.wav').play();
    clearInterval(this.interval);
    if(this.lives > 0) {
      this.respawnShip();
      this.interval = setInterval(this.loop, 10);
      this.lives -= 1;
    } else {
      this.over = true;
      window.addEventListener("keydown", ()=>{
          this.reload(1, 0, 3);
        }, {once: true})
    }
  }

  respawnShip() {
    var clear = false;
    while (!clear) {
      var ship = new Ship( Math.random()*this.width,
                           Math.random()*this.height,
                           0,
                           this.width,
                           this.height
                          );
      clear = this.checkClearSpawn(ship);
    }
    this.ship = ship;

  }

  update() {
    if(this.over) return;
    if(this.warpCD > 0) {
      this.warpCD -= 1;
    }
    this.newLevel();
    this.blowAsteroids();
    this.checkAsteroidCollisions();
    this.ship.update(this.asteroids);
    if(this.alien){
      this.alien.update();
    }
    this.asteroids.forEach((ast) => {
      ast.update();
    });
    //this.spawnAlien();

  }

  spawnAlien(){
    if(!this.alien && Math.round(Math.random()*100) === 1) {
      console.log('alien!!');
      this.alien =  new Alien( Math.random()*this.width,
                               Math.random()*this.height,
                               Math.random()*Math.PI * 2,
                               this.width,
                               this.height
                            );
    }
  }

  renderScore(ctx) {
    ctx.font = "20px hyperspace";
    ctx.fillStyle = "white";
    ctx.fillText("Score: "+this.score, 10, 25);
  }

  renderLives(ctx) {
    ctx.font = "20px hyperspace";
    ctx.fillStyle = "white";
    ctx.fillText("Lives: "+this.lives, this.width-105, 25);
  }

  renderLevel(ctx) {
    ctx.font = "20px hyperspace";
    ctx.fillStyle = "white";
    ctx.fillText("Level: "+this.level, this.width/2-50, 25);
  }

  renderOver(ctx) {
    ctx.save();
    ctx.fillStyle = 'black'
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0,0,this.width,this.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "ivory";
    ctx.font = '60px hyperspace';
    ctx.fillText('Game Over!', this.width/2 - 4.5*40, 200);
    ctx.font = '40px hyperspace';
    ctx.fillText("Your score: " + this.score.toString(), this.width/2-145-this.score.toString().length*18, 300);
    ctx.font = '20px hyperspace';
    ctx.fillText("- Press any key for new game -", this.width/2 - 190, 410);
    ctx.restore();
    return;
  }

  renderLevelUp(ctx) {
    ctx.save();
    ctx.fillStyle = 'black'
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0,0,this.width,this.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "ivory";
    ctx.font = '60px hyperspace';
    ctx.fillText('LEVEL ' + this.level.toString(), this.width/2 - 3*40, 250);
    ctx.font = '20px hyperspace';
    ctx.fillText("- Get ready in "+Math.round(this.lvlScreenTimer/100).toString()+" -", this.width/2 - 110, 410);
    ctx.restore();
    return;
  }

  renderPause(ctx) {
    ctx.save();
    ctx.fillStyle = 'black'
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0,0,this.width,this.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "ivory";
    ctx.font = '60px hyperspace';
    ctx.fillText('<<- PAUSED ->>', this.width/2 - 6*40, 100);
    ctx.font = '30px hyperspace';
    ctx.fillText("Turn:     LEFT / RIGHT arrows", 60, 180);
    ctx.fillText("Thruster: UP arrow", 60, 230);
    ctx.fillText("Fire:     SPACE key", 60, 280);
    ctx.fillText("Warp:     'w' (1 per 10 sec)", 60, 330);
    ctx.fillText("Pause:    Esc / 'p'", 60, 380);
    ctx.font = '20px hyperspace';
    ctx.fillText("<<- Press Esc or 'p' to continue ->>", this.width/2 - 220, 430);
    ctx.restore();
    return;
  }

  render() {
    this.backBufferContext.fillStyle = 'black';
    this.backBufferContext.fillRect(0, 0, this.width, this.height);
    this.renderScore(this.backBufferContext);
    this.renderLives(this.backBufferContext);
    this.renderLevel(this.backBufferContext);
    this.ship.render(this.backBufferContext);
    this.asteroids.forEach((ast) => {
      ast.render(this.backBufferContext);
    });
    if (this.over) {
      this.renderOver(this.backBufferContext);
    }
    if (this.levelUp) {
      this.renderLevelUp(this.backBufferContext);
    }
    if (this.paused) {
      this.renderPause(this.backBufferContext);
    }
    if(this.alien){
      this.alien.render(this.backBufferContext);
    }
    // Flip buffers
    this.screenBufferContext.drawImage(this.backBufferCanvas, 0, 0);

  }
  loop() {
    this.update();
    this.render();
  }
  loop1() {
    if(this.lvlScreenTimer > 0) {
      this.render();
      this.lvlScreenTimer -= 1;
    } else {
      this.lvlScreenTimer = 500;
      clearInterval(this.interval);
      this.reload(this.level, this.score, this.lives);
    }
  }
}
