class BloodPacks extends MovableGameObject {
    constructor(playground, x, y, vx, vy, speed, moveLength, radius, idx) {
        super(x, y, vx, vy, speed, moveLength);
        this.playground = playground;
        this.ctx = playground.game_map.ctx;
        this.img = new Image();
        this.img.src = "https://gss0.baidu.com/-vo3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=da7a4646184c510fae91ea1c50690915/b21bb051f81986186b44770a48ed2e738bd4e639.jpg";
        this.radius = radius;
        this.owner = null;
        this.idx = idx;
        this.friction = 0.985;
    }

    start() {

    }

    finalize() {
        let len = this.playground.game_map.rewards.length;
        for (let i = this.idx + 1; i < len; i++) {
            this.playground.game_map.rewards[i].idx--;
        }
        this.playground.game_map.rewards.splice(this.idx, 1);
    }

    work() {
        this.owner.HP++;
    }

    check() {
        let lenx, leny;
        if (this.owner.charactor == ME) { //我的火球打击到血包
            lenx = this.owner.x - this.x + this.playground.offset_x;
            leny = this.owner.y - this.y + this.playground.offset_y;
        } else { //别人的火球打击到血包
            lenx = this.owner.x - this.x;
            leny = this.owner.y - this.y;
        }
        let distance = Math.sqrt(lenx * lenx + leny * leny);
        if (distance < this.radius + this.owner.radius) { //捡到
            this.work();
            this.destroy();
        }
    }

    check_stop() {
        if (this.moveLength < 0.01) {
            this.moveLength = 0;
            this.speed = BLOOD_PACKS_SPEED;
            this.vx = this.vy = 0;
            return true;
        }
        return false;
    }

    update() {
        if (this.owner) {
            this.check();
            if (this.owner.charactor == ME)
                this.move_to(this.owner.x + this.playground.offset_x, this.owner.y + this.playground.offset_y);
            else
                this.move_to(this.owner.x, this.owner.y);
        } else {
            this.speed *= this.friction;
        }
        if (!this.check_stop()) {
            this.update_position();
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
            this.ctx.strokeStyle = "orange";
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, x - radius, y - radius, radius * 2, radius * 2);
            this.ctx.restore();
        }
    }
}