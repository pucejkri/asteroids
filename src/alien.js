export default class Alien
{
	constructor(x, y, phi, windowWidth, windowHeight) {
		this.windowWidth = windowWidth;
		this.windowHeight = windowHeight;
		this.x = x;
		this.y = y;
		this.prevx = x;
		this.prevy = y;
		this.v = (Math.random()*0.9 + 0.1)/4;
		this.phi= phi;
		this.dx = Math.sin(this.phi)*this.v;
		this.dy = -Math.cos(this.phi)*this.v;
		this.length = 30;
		this.height = 15;

		this.mass = Math.PI*this.r*this.r;
		this.recoil = 0;
		this.destroyed = false;
		this.render = this.render.bind(this);
		this.getPose = this.getPose.bind(this);
		this.getState = this.getState.bind(this);
		this.getRadius = this.getRadius.bind(this);
		this.update = this.update.bind(this);
	}

	getPose() {
		return {x: this.x, y: this.y, phi: this.phi};
	}

	getPrevPos() {
		return {x: this.prevx, y: this.prevy};
	}

	getVelocity() {
		return {dx: this.dx, dy: this.dy, v: this.v};
	}

	getState() {
		return this.state;
	}

	getRadius() {
		return this.r;
	}

	modPos() {
    this.x = (this.x + this.windowWidth)%this.windowWidth;
    this.y = (this.y + this.windowHeight)%this.windowHeight;
  }

	update() {
		this.modPos();
		this.prevx = this.x;
		this.prevy = this.y;
		this.x += this.dx;
		this.y += this.dy;
		if (this.recoil > 0) {
      this.recoil -= 1;
    }

	}

	blow() {
		this.destroyed = true;
	}

	getDestroyed() {
		return this.destroyed;
	}

	getDist(x, y) {
		return Math.sqrt((this.x-x)*(this.x-x) + (this.y-y)*(this.y-y));
	}

	getPrevDist(x, y) {
		return Math.sqrt((this.prevx-x)*(this.prevx-x) + (this.prevy-y)*(this.prevy-y));
	}

	render(ctx) {
		ctx.save();
		ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.phi);
		this.drawEllipseByCenter(ctx, 0, 0, this.height, this.length);
    ctx.closePath();
    ctx.stroke();
		ctx.restore();
	}

	drawEllipseByCenter(ctx, cx, cy, w, h) {
  	this.drawEllipse(ctx, cx - w/2.0, cy - h/2.0, w, h);
	}

	drawEllipse(ctx, x, y, w, h) {
  	var kappa = .5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  	ctx.beginPath();
  	ctx.moveTo(x, ym);
  	ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  	ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  	ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  	ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  	//ctx.closePath(); // not used correctly, see comments (use to close off open path)
  	ctx.stroke();
	}

}
