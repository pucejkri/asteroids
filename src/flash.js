export default class Flash
{
	constructor(x, y, dx, dy, windowW, windowH) {
    this.windowWidth = windowW;
    this.windowHeight = windowH;
    this.fire = true;
    this.dead = false;
		this.x = x;
		this.y = y;
    this.dx = dx*2;
    this.dy = dy*2;
		this.phi = Math.atan2(dx, dy);
    this.jab = new Audio('sounds/Jab.wav');
    this.punch = new Audio('sounds/Punch.wav');

    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.getPos = this.getPos.bind(this);
    this.checkDeath = this.checkDeath.bind(this);
    this.getDead = this.getDead.bind(this);
    this.checkHit = this.checkHit.bind(this);
	}

	update(asteroids) {
    this.checkDeath();
    this.checkHit(asteroids);
    this.x += this.dx;
    this.y += this.dy;
	}

  getPos() {
    return {x: this.x, y: this.y};
  }

  getDead() {
    return this.dead;
  }



  checkDeath() {
    if (this.x <= 0 || this.y <= 0 || this.x >= this.windowWidth || this.y >= this.windowHeight) {
      this.dead = true;
    }
  }

	checkHit(asteroids) {
		asteroids.forEach((asteroid) => {
			if(asteroid.getDist(this.x, this.y) <= asteroid.getRadius()) {
				this.dead = true;
				asteroid.blow();
			}
		});
	}

	render(ctx) {
		ctx.save();
		ctx.strokeStyle = 'white';
		ctx.beginPath();
		ctx.translate(this.x, this.y);
		ctx.rotate(-this.phi);
		ctx.moveTo(0, -6);
		ctx.lineTo(0, 0);
		ctx.closePath();
    ctx.stroke();
		ctx.restore();
	}

}
