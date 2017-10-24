export default class Asteroid
{
	constructor(x, y, r, phi, windowWidth, windowHeight) {
		this.windowWidth = windowWidth;
		this.windowHeight = windowHeight;
		this.x = x;
		this.y = y;
		this.prevx = x;
		this.prevy = y;
		this.v = (Math.random()*0.9 + 0.1)/4;
		this.phi= phi;
		this.r = r;
		this.dx = Math.sin(this.phi)*this.v;
		this.dy = -Math.cos(this.phi)*this.v;

		this.mass = Math.PI*this.r*this.r;
		this.recoil = 0;
		this.shape = [];
		this.randPoly();
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

	impact(dx, dy){
		if (this.recoil <= 0) {
      this.dx = dx;
			this.dy = dy;
      this.recoil = 10;
			return true;
    }
		return false;
	}

	getMass() {
		return this.mass;
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

	randPoly() {
		var vertices = Math.floor(Math.random() * 10) + 7;
		for(var i = 0 ; i < 2*vertices ; i++) {
			var theta = i*Math.PI/vertices;
			this.shape[i] = Math.sin(theta)*(this.r + (Math.random())*5);
			i++
			this.shape[i] = Math.cos(theta)*(this.r + (Math.random())*5);
		}
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

	renderCircle(ctx) {
		ctx.save();
		ctx.strokeStyle = 'red';
		ctx.beginPath();
		ctx.arc(0,0,this.r,0,2*Math.PI)
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	render(ctx) {
		ctx.save();
		ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.phi);
		ctx.moveTo(this.shape[0], this.shape[1]);
		for( var i = 2 ; i < this.shape.length-1 ; i += 2 ) {
			ctx.lineTo( this.shape[i] , this.shape[i+1] )
		}
    ctx.closePath();
    ctx.stroke();
		ctx.restore();
	}

}
