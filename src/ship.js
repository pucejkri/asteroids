import Flash from './flash';

export default class Ship{
  constructor(x, y, phi, windowW, windowH) {
    this.x = x;
    this.y = y;
    this.phi = phi;
    this.length = 10;
    this.width = 12;
    this.v = 0;
    this.dx = 0;
    this.dy = 0;
    this.vang = 0;
    this.dv = 0.02;
    this.vMax = 1
    this.radius = 20;
    this.dphiSet = 0.03;
    this.firemode = 40;
    this.windowWidth = windowW;
    this.windowHeight = windowH;
    this.direction = 'none';
    this.throttle = false;
    this.fire = false;
    this.invincible = true;
    this.invInterval = 300;
    this.recoil = 0;
    this.flashes = [];
    this.flashesTmp = [];
    // Bind class methods
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.getPose = this.getPose.bind(this);
    this.getVelocities = this.getVelocities.bind(this);
    this.rotate = this.rotate.bind(this);
    this.checkImpact = this.checkImpact.bind(this);
  }

  getPose() {
    return {x: this.x, y: this.y, phi: this.phi}
  }

  getRadius() {
    return this.radius;
  }

  getDist(x, y) {
		return Math.sqrt((this.x-x)*(this.x-x) + (this.y-y)*(this.y-y));
	}
  getVelocities() {
    return {dx: this.dx, dy: this.dy};
  }

  getInvincible() {
    return this.invincible;
  }

  getVerts() {
    return [ this.x - this.length*Math.sin(-this.phi),
             this.y - this.length*Math.cos(-this.phi),
             this.x + this.length*Math.sin(-this.phi) + this.width/2*Math.cos(this.phi),
             this.y + this.length*Math.cos(-this.phi) + this.width/2*Math.sin(this.phi),
             this.x + this.length*Math.sin(-this.phi) - this.width/2*Math.cos(this.phi),
             this.y + this.length*Math.cos(-this.phi) - this.width/2*Math.sin(this.phi)
           ]
  }

  setDirection(dir) {
    this.direction = dir;
  }

  setThrottle(thr) {
    this.throttle = thr;
  }

  setFire(fir) {
    this.fire = fir;
  }

  setFiremode(n) {
    this.firemode = n;
  }

  rotate() {
    switch (this.direction) {
      case 'left':
        this.phi -= this.dphiSet;
        break;

      case 'right':
        this.phi += this.dphiSet;
        break;

      default:
        break;
    }
  }

  propulse() {
    if (this.throttle) {
      this.dx += Math.sin(this.phi)*this.dv;
      this.dy += -Math.cos(this.phi)*this.dv;
    }
    this.v = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
    if(this.v > this.vMax) {
      this.dx = this.dx/this.v*this.vMax;
      this.dy = this.dy/this.v*this.vMax;
    }
    this.dx = 0.999*this.dx;
    this.dy = 0.999*this.dy;
    this.x += this.dx;
    this.y += this.dy;

  }

  shoot() {
    if (this.fire && this.recoil <= 0 && !this.invincible) {
      new Audio('sounds/laser.wav').play();
      this.flashes.push(new Flash(this.x, this.y, Math.sin(this.phi), -Math.cos(this.phi), this.windowWidth, this.windowHeight))
      this.recoil = this.firemode;
    }
    if (this.recoil > 0) {
      this.recoil -= 1;
    }
  }

  modPos() {
    this.x = (this.x + this.windowWidth)%this.windowWidth;
    this.y = (this.y + this.windowHeight)%this.windowHeight;
  }

  lowerShield() {
    if(this.invincible) {
      if(this.invInterval > 0) {
        this.invInterval -= 1;
      } else {
        this.invincible = false;
      }
    }
  }

  update(asteroids) {
    this.lowerShield();
    this.rotate();
    this.propulse();
    this.modPos();
    this.shoot();
    this.flashes.forEach((flash) => {
      if(!flash.getDead()) {
        this.flashesTmp.push(flash);
      }
    });
    this.flashes = this.flashesTmp;
    this.flashesTmp = [];
    this.flashes.forEach((flash) => {flash.update(asteroids)});

  }



  checkImpact() {
    var vertices = this.getVerts();
    for ( var i = 0 ; i < vertices.length ; i = i+2) {

    }

	}
  renderVerts(ctx) {
    ctx.save();
    ctx.strokeStyle = 'yellow';
    var verts = this.getVerts();
    ctx.beginPath();
    ctx.arc(verts[0], verts[1], 3, 0, 2*Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(verts[2], verts[3], 3, 0, 2*Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(verts[4], verts[5], 3, 0, 2*Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  renderShield(ctx) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.globalAlpha = this.invInterval/300;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.arc(0, 0, 2*this.length, 0, 2*Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  renderThrust(ctx) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.phi);
    ctx.moveTo(0, 2.5*this.length);
    ctx.lineTo(this.width/3, 1.5*this.length);
    ctx.lineTo(-this.width/3, 1.5*this.length);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /** @function render
    * Render the paddle
    */
  render(ctx) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.phi);
    ctx.moveTo(0, -this.length);
    ctx.lineTo(this.width/2, this.length);
    ctx.lineTo(-this.width/2, this.length);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    if(this.throttle) {
      this.renderThrust(ctx);
    }
    if(this.invincible) {
      this.renderShield(ctx);
    }
    this.flashes.forEach((flash) => {flash.render(ctx);});

  }
}
