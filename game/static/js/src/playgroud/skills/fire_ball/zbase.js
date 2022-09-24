class FireBall extends MovableGameObject {
    constructor(owner, idx, radius, color, speed, vx, vy, moveLength, damage = 1,
        offset_x, offset_y, offset_owner_x, offset_owner_y
    ) {
        super(owner.x, owner.y, vx, vy, speed, moveLength);
        this.owner = owner;
        this.playground = owner.playground;
        this.idx = idx; //记录自己在fire_balls数组里的下标
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.damage = damage;
        this.offset_x = offset_x;
        this.offset_y = offset_y;
        this.offset_owner_x = offset_owner_x;
        this.offset_owner_y = offset_owner_y;
        this.eps = 0.01;
        this.transform_speed = 1; //球变大变小的速率
        this.transformed_radius = radius;
    }

    start() {}

    check_players() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player.uuid !== this.owner.uuid) {
                let lenx, leny;
                if (this.owner.charactor == ME && player.charactor != ME) { //我的火球打击别人
                    lenx = this.x - player.x + this.offset_x;
                    leny = this.y - player.y + this.offset_y;
                } else if (this.owner.charactor != ME) { //别人的火球打击到别人
                    if (player.charactor != ME) { //打击到除我之外的人
                        lenx = this.x - player.x;
                        leny = this.y - player.y;
                    } else if (player.charactor == ME) { //打击到我
                        lenx = this.x - this.playground.offset_x - player.x;
                        leny = this.y - this.playground.offset_y - player.y;
                    }
                }
                let distance = Math.sqrt(lenx * lenx + leny * leny);
                if (distance < this.radius + player.radius) { //命中！！
                    //这里写被击中敌人要执行什么逻辑
                    this.damage_work_player(player, i);
                    //火球自己消失  
                    this.destroy();
                    break;
                } else if (player.shield && distance < this.radius + player.shield_size) {
                    //命中了护盾
                    player.shield = false;
                    this.destroy();
                    break;
                }
            }
        }
    }

    check_all_fire_balls() {
        let player_len = this.playground.players.length;
        for (let i = 0; i < player_len; i++) {
            let player = this.playground.players[i];
            let fire_balls_len = player.fire_balls.length;
            let realationship = 0;
            if (this.owner.charactor == ME) {
                if (player.charactor == ME) //我的火球打击自己的火球
                    realationship = 1;
                else
                    realationship = 2; //打击到别人的火球
            } else { //别人的火球打击到别人
                if (player.charactor != ME) //打击到除我之外的人
                    realationship = 1;
                else //打击到我
                    realationship = 3;
            }
            for (let j = 0; fire_balls_len > 1 && j < fire_balls_len; j++) {
                if (this.owner.uuid == player.uuid && this.idx == j) {
                    continue;
                }
                let lenx, leny;
                let fire_ball = player.fire_balls[j];
                switch (realationship) {
                    case 1:
                        lenx = this.x - fire_ball.x;
                        leny = this.y - fire_ball.y;
                        break;
                    case 2:
                        lenx = this.x - fire_ball.x + this.offset_x;
                        leny = this.y - fire_ball.y + this.offset_y;
                        break;
                    case 3:
                        lenx = this.x - this.playground.offset_x - fire_ball.x;
                        leny = this.y - this.playground.offset_y - fire_ball.y;
                        break;
                    default:
                        break;
                }
                let distance = Math.sqrt(lenx * lenx + leny * leny);
                if (distance < this.radius + fire_ball.radius) { //命中！！
                    if (this.owner.uuid != player.uuid) //击中别人的火球
                        this.hit_others_fire_ball(fire_ball);
                    else
                        this.hit_my_fire_ball(fire_ball);
                    break;
                }
            }
        }
    }

    calculate_dist(object) {
        let lenx, leny;
        if (this.owner.charactor == ME) { //我的火球打击到地图上的物品
            lenx = this.x - object.x + this.offset_x;
            leny = this.y - object.y + this.offset_y;
        } else { //别人的火球打击到
            lenx = this.x - object.x;
            leny = this.y - object.y;
        }
        let distance = Math.sqrt(lenx * lenx + leny * leny);
        return distance < this.radius + object.radius ? true : false;
    }

    check_blood_packs() {
        let len = this.playground.game_map.rewards.length;
        for (let i = 0; i < len; i++) {
            let reward = this.playground.game_map.rewards[i];
            if (this.calculate_dist(reward)) {
                //确定奖励的主人，然后奖励就会自己移动到主人身上，然后主人会获得加成
                reward.owner = this.owner;
                this.destroy();
                break;
            }
        }
    }

    check_booms() {
        let len = this.playground.game_map.booms.length;
        for (let i = 0; i < len; i++) {
            let boom = this.playground.game_map.booms[i];
            if (this.calculate_dist(boom)) {
                boom.awake = true;
                this.destroy();
                break;
            }
        }
    }

    damage_check() {
        this.check_players();
        this.check_all_fire_balls();
        this.check_blood_packs();
        this.check_booms();
    }

    hit_others_work(lived_ball, dead_ball) {
        lived_ball.damage -= dead_ball.damage;
        lived_ball.transform_speed = FIRE_BALL_SMALLEN_SPEED; //变小
        lived_ball.transformed_radius -= dead_ball.radius; //变小后的半径
        lived_ball.speed *= 0.8; //减速
        Particle.make_particle(dead_ball, this.playground.scale, dead_ball.damage, dead_ball.owner.charactor);
        dead_ball.destroy();
    }

    hit_mine_work(lived_ball, dead_ball) {
        lived_ball.damage += dead_ball.damage;
        lived_ball.transform_speed = FIRE_BALL_LARGEN_SPEED; //变大
        lived_ball.transformed_radius += dead_ball.radius * 1.2; //变大后的半径
        lived_ball.speed *= 1.5; //加速
        lived_ball.moveLength *= 1.3;
        dead_ball.destroy();
    }

    hit_others_fire_ball(fire_ball) {
        if (this.radius < fire_ball.radius) {
            //我的火球比别人的小，那么我的火球会消失，别人的火球会变小，然后速度减小
            this.hit_others_work(fire_ball, this);
        } else if (this.radius > fire_ball.radius) {
            //我的火球比别人的大，那么我的变小，减速，他的消失
            this.hit_others_work(this, fire_ball);
        } else {
            //一样大，直接一起死
            Particle.make_particle(this, this.playground.scale, this.damage, this.owner.charactor);
            Particle.make_particle(fire_ball, this.playground.scale, fire_ball.damage, fire_ball.owner.charactor);
            this.destroy();
            fire_ball.destroy();
        }
    }

    hit_my_fire_ball(fire_ball) {
        if (this.radius <= fire_ball.radius) {
            //我的较小球打中的我的较大球(或者大小一致的球），那么较小球融入较大球中，并且变大、加速
            this.hit_mine_work(fire_ball, this);
        } else {
            //较大球击中较小球，较小球融入较大球
            this.hit_mine_work(this, fire_ball);
        }
    }


    //被击中的敌人HP - damage 、被击退一段距离并且被定身一小段时间
    damage_work_player(player, i) {
        player.be_hit(this.damage, this.vx, this.vy);
        if (this.playground.game_mode == MULTI_MODE) {
            this.playground.mps.send_hit_player(player.uuid, this.damage, this.vx, this.vy);
        }
        //由于被击退是非线性的，所以减到后期速度很小，就间接实现了被击中后不能移动一段时间
        //改变移动距离的系数和速度倍率共同作用于移动距离和定身时间
        if (player.HP <= 0) {
            if (this.owner.charactor == ME) {
                //你的火球造成终结一击后获得两个火球;
                this.owner.cd.readyed_fire_ball_num += 2;
            }
            player.destroy();
            this.playground.players.splice(i, 1); //从玩家列表中删除这个玩家
        }
    }

    check_state() {
        if (this.moveLength < this.eps || this.speed < this.eps)
            return false;
        return true;
    }

    update_radius() {
        if (this.transform_speed != 1.0) {
            this.radius *= this.transform_speed;
            if (Math.abs(this.radius - this.transformed_radius) < this.eps)
                this.transform_speed = 1.0;
        }
    }

    update() {
        if (!this.check_state()) {
            this.destroy();
            return;
        }
        this.update_position();
        this.update_radius();
        //检测是否命中敌人
        this.damage_check();
        this.render();
    }

    finalize() {
        let len = this.owner.fire_balls.length;
        for (let i = this.idx + 1; i < len; i++) {
            this.owner.fire_balls[i].idx--;
        }
        this.owner.fire_balls.splice(this.idx, 1);
    }

    render() {
        let scale = this.playground.scale;
        let x, y;
        let radius = this.radius * scale;;
        if (this.owner.charactor == ME) {
            x = (this.x - this.offset_owner_x) * scale;
            y = (this.y - this.offset_owner_y) * scale;
        } else {
            x = (this.x - this.playground.offset_x) * scale;
            y = (this.y - this.playground.offset_y) * scale;
        }
        if (this.owner.charactor == ME || this.playground.check_in_camare(x, y, radius)) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
}