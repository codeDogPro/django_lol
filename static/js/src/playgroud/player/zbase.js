class Player extends MovableGameObject {
    constructor(playground, HP, x, y, radius, color, speed, charactor, username, photo = "") {
        super(x, y, 0, 0, speed, 0);
        this.playground = playground;
        this.HP = HP;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        //1是自己，2是人机，3是敌人
        this.charactor = charactor;
        this.eps = 0.01;
        this.shield = false; //w技能  护盾
        this.shield_size = this.radius * 3;
        this.is_bursting = false;
        this.cur_skill = 0; //q : 1, w : 2, e : 3, r : 4, d : 5, f : 6
        this.be_hitted = false;
        this.friction = 0.93; //被击中后的击退效果实现非线性(有摩擦力)
        if (this.charactor == ME) {
            this.mouse_x = 0; //用于实现快捷施法
            this.mouse_y = 0;
            this.cd = new CD(playground); //技能CD的类
        }
        this.fire_balls = []; //储存自己所有的火球
        this.username = username;
        if (this.charactor != ROBOT) {
            this.img = new Image();
            this.img.src = photo;
        } else {
            //只有人机有这个成员变量
            switch (this.playground.difficulty) {
                case 1: //简易
                    this.probability = 1000;
                    break;
                case 2: //一般
                    this.probability = 550;
                    break;
                case 3: //困难
                    this.probability = 420;
                    break;
                default:
            }
        }
    }

    start() {
        if (this.charactor == ME) {
            this.add_listening_event();
        } else if (this.charactor == ROBOT) {
            this.ai_move();
        }
    }

    unleash_skills(mx, my, offset_x = 0, offset_y = 0) {
        if (this.cur_skill >= 1 && this.cur_skill <= 5) {
            let lenx = mx - this.x;
            let leny = my - this.y;
            let moveLength = Math.sqrt(lenx * lenx + leny * leny); //计算两点之间的距离
            let vx = lenx / moveLength;
            let vy = leny / moveLength;
            switch (this.cur_skill) {
                case 1: //释放q技能
                    let speed_scale = this.fire_balls.length == 0 ? 1 : this.fire_balls.length + 1;
                    //初始的时候最多可以存储五个火球，每个火球的发射速度不一样，后面发射的火球速度比前面的快，这样才容易融合
                    this.fire_balls.push(new FireBall(
                        this,
                        this.fire_balls.length, //索引下标
                        0.015, //radius
                        "red",
                        FIRE_BALL_SPEED * speed_scale,
                        vx,
                        vy,
                        0.5,
                        1, //damage
                        offset_x,
                        offset_y,
                        0, 0
                    ));
                    break;
                case 2: //施法w技能
                    this.shield = true;
                    break;
                case 3: //释放e技能
                    if (!this.is_bursting)
                        new Burst(this.playground, this, vx, vy);
                    break;
                default:
                    break;
            }
            this.cur_skill = 0;
        }
    }

    add_listening_event() {
        let outer = this;
        //关闭浏览器中右键显示的菜单
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        //鼠标点击事件
        let rect = this.ctx.canvas.getBoundingClientRect();
        this.playground.game_map.$canvas.mousedown(function(e) {
            rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                if (outer.HP > 0 && !outer.be_hitted && !outer.is_bursting) {
                    outer.move_to((e.clientX - rect.left) / outer.playground.scale,
                        (e.clientY - rect.top) / outer.playground.scale);
                    if (outer.playground.game_mode == MULTI_MODE) {
                        //传给其他玩家的坐标需要加上自己视角中的偏移量之后才与别的玩家视角中你的人物的坐标对应
                        let x = outer.x + outer.playground.offset_x;
                        let y = outer.y + outer.playground.offset_y;
                        //vx,vy和moveLength在本身自己调用move_to的时候就已经计算好了，所以直接传过去就不用再计算了
                        outer.playground.mps.send_move_to(outer.uuid, x, y, outer.vx, outer.vy, outer.moveLength);
                    }
                }
            }
        });

        this.playground.game_map.$canvas.mousemove(function(e) {
            if (outer.HP > 0) {
                //快捷施法！！
                outer.mouse_x = e.clientX - rect.left;
                outer.mouse_y = e.clientY - rect.top;
            }
        })

        $(window).keydown(function(e) {
            if (outer.HP > 0 && !outer.be_hitted) {
                switch (e.which) {
                    case 81: //q
                        if (outer.cd.unleash_fire_ball_request()) {
                            outer.cur_skill = 1;
                            if (outer.playground.game_mode == MULTI_MODE) {
                                outer.playground.mps.send_shoot_fire_ball(
                                    outer.uuid,
                                    (outer.mouse_x) / outer.playground.scale + outer.playground.offset_x,
                                    (outer.mouse_y) / outer.playground.scale + outer.playground.offset_y,
                                    outer.playground.offset_x,
                                    outer.playground.offset_y
                                );
                            }
                        }
                        break;
                    case 87: //w
                        if (outer.cd.unleash_shield_request()) {
                            outer.cur_skill = 2;
                            if (outer.playground.game_mode == MULTI_MODE) {
                                outer.playground.mps.send_shield(outer.uuid);
                            }
                        }
                        break;
                    case 69: //e
                        if (outer.cd.unleash_burst_request()) {
                            outer.cur_skill = 3;
                            if (outer.playground.game_mode == MULTI_MODE) {
                                outer.playground.mps.send_burst(
                                    outer.uuid,
                                    (outer.mouse_x) / outer.playground.scale + outer.playground.offset_x,
                                    (outer.mouse_y) / outer.playground.scale + outer.playground.offset_y,
                                );
                            }
                        }
                        break;
                    case 82: //r
                        outer.cur_skill = 4;
                        break;
                    case 68: //d
                        outer.cur_skill = 5;
                        break;
                    case 70: //f
                        outer.cur_skill = 6;
                        break;
                    case 83: //s
                        if (!outer.be_hitted && !outer.is_bursting) {
                            outer.moveLength = 0;
                            if (outer.playground.game_mode == MULTI_MODE) {
                                outer.playground.mps.send_move_stop(outer.uuid);
                            }
                        }
                        break;
                    default:
                }
                outer.unleash_skills(
                    (outer.mouse_x) / outer.playground.scale,
                    (outer.mouse_y) / outer.playground.scale,
                    outer.playground.offset_x,
                    outer.playground.offset_y
                );
            }
        });
    }

    ai_unleash_skills() {
        let p = Math.floor(Math.random() * this.probability);
        if (p == 2) {
            //按概率释放六个技能中的一个(后续会调概率权重)
            let index = 1 + Math.floor(Math.random() * 6);
            let time = 1; //默认只放一次技能
            switch (index) {
                case 1:
                case 2:
                case 3:
                case 4:
                    this.cur_skill = 1;
                    time = this.difficulty == 3 ? 4 : 3;
                    break;
                case 5:
                    this.cur_skill = 2;
                    break;
                case 6:
                    this.cur_skill = 3;
                    break;
                default:
                    break;
            }
            //所有人机都对着你打
            let goal = this.playground.players[this.playground.players.length - 1];
            let x = goal.x;
            let y = goal.y;
            for (let i = 0; i < time; i++) {
                if (time == 3)
                    this.cur_skill = 1;
                this.unleash_skills(x, y);
            }
        }
    }

    ai_move() {
        let x = (-1.5 + Math.random() * 4) * this.playground.camare_width / this.playground.scale;
        let y = (-1.5 + Math.random() * 4);
        this.move_to(x, y);
    }

    be_hit(damage, vx, vy) {
        this.be_hitted = true;
        this.is_bursting = false;
        this.HP -= damage;
        this.vx = 2 * vx * damage;
        this.vy = 2 * vy * damage;
        this.moveLength = 0.12 * damage;
        //产生被击中的粒子效果
        Particle.make_particle(this, this.playground.scale, damage, this.charactor);
    }

    update() {
        let moved_xy = Math.min(this.moveLength, this.speed * this.time_delta * 0.001);
        let moved_x = this.vx * moved_xy;
        let moved_y = this.vy * moved_xy;
        if (this.charactor == ME) {
            //只有我自己会更新偏移
            //其他所有人会在绘图的时候加上这个偏移(偏移等于我实际移动的相反数)
            this.playground.update_offset(moved_x, moved_y, this.radius);
            this.update_fireBalls_offset(moved_x, moved_y);
            //cd更新
            this.cd.update_cd();
        }
        this.update_position(moved_x, moved_y, moved_xy);

        this.render();
    }

    update_fireBalls_offset(moved_x, moved_y) {
        for (let i = 0; i < this.fire_balls.length; i++) {
            this.fire_balls[i].offset_owner_x += moved_x;
            this.fire_balls[i].offset_owner_y += moved_y;
        }
    }

    update_position(moved_x, moved_y, moved_xy) {
        if (this.moveLength < this.eps) {
            this.moveLength = 0;
            this.be_hitted = false;
            this.is_bursting = false;
            if (this.charactor != ROBOT) {
                this.vx = this.vy = 0;
            } else {
                //只有机器人才会自动移动
                this.ai_move();
            }
        } else {
            //被击中时减速
            if (this.be_hitted || this.is_bursting) {
                this.vx *= this.friction;
                this.vy *= this.friction;
            }
            if (this.charactor == ROBOT) {
                //AI 释放技能
                this.ai_unleash_skills();
            }
            if (this.charactor != ME) {
                //只要不是自己就更新球的坐标
                this.x += moved_x;
                this.y += moved_y;
            }
            this.moveLength -= moved_xy;
        }
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
        //在相机中才显示
        if (this.charactor == ME || this.playground.check_in_camare(x, y, radius)) {
            //护盾
            if (this.shield) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, this.shield_size * scale, Math.PI * 2, false);
                this.ctx.strokeStyle = this.color;
                this.ctx.stroke();
            }
            //血量
            this.ctx.beginPath();
            this.ctx.arc(x, y, 0.007 * scale + radius, 0, Math.PI * 2 * this.HP * 0.05, false);
            this.ctx.fillStyle = "red";
            this.ctx.fill();
            if (this.charactor != 2) {
                //不是人机的话显示图片
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
                this.ctx.stroke();
                this.ctx.clip();
                this.ctx.drawImage(this.img, x - radius, y - radius, radius * 2, radius * 2);
                this.ctx.restore();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
                this.ctx.fillStyle = this.color;
                this.ctx.fill();
            }
        }
    }

    finalize() {
        let idx = this.playground.game_map.rewards.length;
        let angle = Math.PI * 2 * Math.random();
        let vx = Math.cos(angle),
            vy = Math.sin(angle);
        this.playground.game_map.rewards.push(new BloodPacks(
            this.playground,
            this.x,
            this.y,
            vx,
            vy,
            BLOOD_PACKS_SPEED / 2,
            GENERATE_REWARDS_MOVELENGTH,
            0.025, //radius
            idx
        ))
    }
}