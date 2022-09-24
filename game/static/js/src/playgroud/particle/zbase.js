class Particle extends MovableGameObject {
    constructor(playground, x, y, radius, color, speed, vx, vy, moveLength, charactor) {
        super(x, y, vx, vy, speed, moveLength);
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.eps = 0.01;
        this.friction = 0.94;
        this.charactor = charactor;
    }

    start() {}

    static make_particle(object, scale, damage, charactor) {
        let particle_num = object.radius * scale * 0.35 * damage;
        if (object.HP <= 0)
            particle_num *= (15 / damage);
        for (let i = 0; i < particle_num; i++) {
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle),
                vy = Math.sin(angle);
            new Particle(
                object.playground,
                object.x,
                object.y,
                object.radius * angle * 0.02,
                object.color,
                PARTICLE_SPEED * Math.random(),
                vx,
                vy,
                angle * Math.random() * 0.38,
                charactor
            )
        }
    }

    check_state() {
        if (this.speed < this.eps || this.moveLength < this.eps)
            return false;
        return true;
    }

    update() {
        if (!this.check_state()) {
            this.destroy();
        }
        this.speed *= this.friction;
        this.update_position();
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let x, y;
        let radius = this.radius * scale;;
        if (this.charactor == ME) {
            x = this.x * scale;
            y = this.y * scale;
        } else {
            x = (this.x - this.playground.offset_x) * scale;
            y = (this.y - this.playground.offset_y) * scale;
        }
        if (this.charactor == 1 || this.playground.check_in_camare(x, y, radius)) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
}