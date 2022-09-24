class MovableGameObject extends GameObject {
    constructor(x, y, vx, vy, speed, moveLength) {
        super();
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.moveLength = moveLength;
    }

    move_to(x, y) {
        let lenx = x - this.x;
        let leny = y - this.y;
        this.moveLength = Math.sqrt(lenx * lenx + leny * leny);
        this.vx = lenx / this.moveLength;
        this.vy = leny / this.moveLength;
        // console.log("x:%f\ny:%f\nmovelength:%f\n", this.x, this.y, this.moveLength);
    }

    update() {
        this.update_position();
    }

    update_position() {
        let moved_xy = Math.min(this.moveLength, this.speed * this.time_delta * 0.001);
        let moved_x = this.vx * moved_xy;
        let moved_y = this.vy * moved_xy;
        this.x += moved_x;
        this.y += moved_y;
        this.moveLength -= moved_xy;
    }
}