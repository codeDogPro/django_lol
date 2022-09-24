class Burst extends GameObject {
    constructor(playground, me, vx, vy) {
        super();
        this.playground = playground;
        this.me = me;
        this.vx = vx;
        this.vy = vy;
        this.damage = 2;
    }

    start() {
        this.me.is_bursting = true;
        this.me.vx = this.vx * 9;
        this.me.vy = this.vy * 9;
        this.me.moveLength = 0.1;
    }

    hit_check() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player.uuid !== this.me.uuid) {
                let lenx, leny;
                if (this.me.charactor == 1 && player.charactor != 1) { //我撞击到别人
                    lenx = this.me.x - player.x + this.playground.offset_x;
                    leny = this.me.y - player.y + this.playground.offset_y;
                } else if (this.me.charactor != 1) { //别人撞击到人
                    if (player.charactor != 1) { //撞击到除我之外的人
                        lenx = this.me.x - player.x;
                        leny = this.me.y - player.y;
                    } else if (player.charactor == 1) { //撞击到我
                        lenx = this.me.x - this.playground.offset_x - player.x;
                        leny = this.me.y - this.playground.offset_y - player.y;
                    }
                }
                let distance = Math.sqrt(lenx * lenx + leny * leny);
                if (distance < this.me.radius + player.radius) { //命中！！
                    //这里写被击中敌人要执行什么逻辑
                    this.damage_work(player, i);
                    this.destroy();
                } else if (player.shield && distance < this.me.radius + player.shield_size) {
                    //命中了护盾
                    player.shield = false;
                    //我停下来
                    this.me.vx = this.me.vy = this.me.moveLength = 0;
                    this.destroy();
                }
            }
        }
    }

    damage_work(player, i) {
        if (player.is_bursting) {
            //如果对方也在突进，则双方都受伤害
            this.me.be_hit(this.damage, -this.me.vx * 0.5, -this.me.vy * 0.5);
            if (this.playground.game_mode == MULTI_MODE) {
                this.playground.mps.send_hit_player(this.me.uuid, this.damage, -this.me.vx * 0.5, -this.me.vy * 0.5);
            }
            if (this.me.HP <= 0) {
                this.me.destroy();
                this.playground.players.splice(0, 1); //从玩家列表中删除我自己
            }
        }

        player.be_hit(this.damage, this.me.vx * 0.625, this.me.vy * 0.625);
        if (this.playground.game_mode == MULTI_MODE) {
            this.playground.mps.send_hit_player(player.uuid, this.damage, this.me.vx * 0.625, this.me.vy * 0.625);
        }
        if (player.HP <= 0) {
            if (this.me.charactor == ME) {
                //杀人重置e的CD
                this.me.cd.readyed_burst_num++;
            }
            player.destroy();
            this.playground.players.splice(i, 1); //从玩家列表中删除这个玩家
        }
    }

    update() {
        this.hit_check();
        if (this.me.moveLength < 0.01)
            this.destroy();
    }

    finalize() {
        this.me.is_bursting = false;
        this.me.vx = this.vx; //恢复原来的速度
        this.me.vy = this.vy;
    }
}