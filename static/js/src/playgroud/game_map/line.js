class Line extends GameObject {
    constructor(playground, ctx, x1, y1, x2, y2) {
        super();
        this.playground = playground;
        this.ctx = ctx;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.eps = 0.01;
    }

    update() {
        this.render();
    }

    check_in_camare(x, y) {
        return (x >= 0 && x <= this.playground.camare_width) || (y >= 0 && y <= this.playground.camare_height);
    }

    render() {
        let scale = this.playground.scale;
        let x1, y1, x2, y2;
        x1 = (this.x1 - this.playground.offset_x) * scale;
        x2 = (this.x2 - this.playground.offset_x) * scale;
        y1 = (this.y1 - this.playground.offset_y) * scale;
        y2 = (this.y2 - this.playground.offset_y) * scale;
        if (this.check_in_camare(x1, y1)) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = "rgba(204, 200, 200, 0.095)";
            this.ctx.stroke();
        }
    }
}