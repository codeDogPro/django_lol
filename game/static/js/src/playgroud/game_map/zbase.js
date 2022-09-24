class GameMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.camare_width;
        this.ctx.canvas.height = this.playground.camare_height;
        this.playground.$playground.append(this.$canvas);
        this.lines = []; //横线
        this.verticals = []; //竖线
        //地图上的奖励
        this.rewards = [];
        //地图上的炸弹
        this.booms = [];
        this.canvas_config = this.playground.map_mode === "big_map" ? 1 : 0.2;
        this.init_line(this.ctx);
    }

    start() {
        this.init_blood_packs();
        this.init_booms();
    }

    init_line(ctx) {
        let distance = this.ctx.canvas.width / 7 / this.playground.scale;
        let x = this.ctx.canvas.width * 2.5 / this.playground.scale;
        let y = 2.5;
        let length = this.ctx.canvas.width * 4 / this.playground.scale;
        for (let i = 0; i < 29; i++) { //竖线
            this.verticals.push(new Line(
                this.playground,
                ctx,
                x,
                y - length + 3,
                x,
                y
            ))
            x -= distance;
        }
        x = this.ctx.canvas.width * 2.5 / this.playground.scale;
        for (let i = 0; i < 17; i++) { //横线
            this.lines.push(new Line(
                this.playground,
                ctx,
                x - length,
                y,
                x,
                y
            ))
            y -= distance;
        }
    }

    init_booms() {
        for (let i = 0; i < 10; i++) {
            let x = (-1.5 + Math.random() * 4) * this.playground.camare_width / this.playground.scale;
            let y = (-1.5 + Math.random() * 4);
            this.booms.push(new Boom(
                this.playground,
                x,
                y,
                0.03, //radius
                i
            ));
        }
    }

    init_blood_packs() {
        for (let i = 0; i < 10; i++) {
            let x = (-1.5 + Math.random() * 4) * this.playground.camare_width / this.playground.scale;
            let y = (-1.5 + Math.random() * 4);
            this.rewards.push(new BloodPacks(
                this.playground,
                x,
                y,
                0,
                0,
                BLOOD_PACKS_SPEED,
                0,
                0.025,
                i
            ));
        }
    }

    resize() {
        this.ctx.canvas.width = this.playground.camare_width;
        this.ctx.canvas.height = this.playground.camare_height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}