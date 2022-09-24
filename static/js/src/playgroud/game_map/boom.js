class Boom extends UnmovableGameObject {
    constructor(playground, x, y, radius, idx) {
        super(x, y);
        this.playground = playground;
        this.ctx = playground.game_map.ctx;
        this.idx = idx;
        this.img = new Image();
        // this.img.src = "https://imgnew5.photophoto.cn/20110222/katongzhadantupian-18987650_2.jpg";
        this.img.src = "https://pic34.photophoto.cn/20150301/0014026901644584_b.jpg";
        this.radius = radius;
        this.largen_speed = 1.01;
        this.damage_range = radius * 5;
        this.final_radius = this.radius * 3;
        this.damage = 5;
        this.awake = false;
    }

    start() {

    }

    finalize() {
        let len = this.playground.game_map.booms.length;
        for (let i = this.idx + 1; i < len; i++) {
            this.playground.game_map.booms[i].idx--;
        }
        this.playground.game_map.booms.splice(this.idx, 1);
    }

    check_damage(object) {
        let lenx, leny;
        if (object.charactor == ME) {
            lenx = this.x - this.playground.offset_x - object.x;
            leny = this.y - this.playground.offset_y - object.y;
        } else {
            lenx = this.x - object.x;
            leny = this.y - object.y;
        }
        let distance = Math.sqrt(lenx * lenx + leny * leny);
        if (distance < this.damage_range + object.radius) {
            this.damage_work(object, lenx / distance, leny / distance);
        }
    }

    damage_work(object, vx, vy) {
        object.be_hit(this.damage);
        object.vx = -vx * 8;
        object.vy = -vy * 8;
        object.moveLength = 0.25;
    }

    work() {
        let len = this.playground.players.length;
        for (let i = 0; i < len; i++) {
            let player = this.playground.players[i];
            this.check_damage(player);
        }
    }

    update() {
        if (this.awake) {
            this.radius *= this.largen_speed;
            this.damage_range *= this.largen_speed;
            if (this.radius >= this.final_radius) {
                this.work();
                this.destroy();
            }
        }
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let x, y;
        let radius = this.radius * scale;;
        x = (this.x - this.playground.offset_x) * scale;
        y = (this.y - this.playground.offset_y) * scale;
        if (this.playground.check_in_camare(x, y, radius)) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            this.ctx.strokeStyle = "red";
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, x - radius, y - radius, radius * 2, radius * 2);
            this.ctx.restore();
            if (this.awake) {
                //显示爆炸范围
                this.ctx.beginPath();
                this.ctx.arc(x, y, this.damage_range * scale, 0, Math.PI * 2, false);
                this.ctx.strokeStyle = "red";
                this.ctx.stroke();
            }
        }
    }
}