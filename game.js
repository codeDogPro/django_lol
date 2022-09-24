class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
    <div class="game_menu">
        <div class="game_menu-field">
            <div class="game_menu-field-item game_menu-field-item-single-mode">
                单人模式
            </div>
            <br>
            <div class="game_menu-field-item game_menu-field-item-multi-mode">
                多人模式
            </div>
            <br>
            <div class="game_menu-field-item game_menu-field-item-settings">
                设置
            </div>
        </div>
    </div>
    `);
        this.root.$game.append(this.$menu);
        this.$single_mode = this.$menu.find('.game_menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.game_menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.game_menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function() {
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function() {
            console.log("click multi mode");
        });
        this.$settings.click(function() {
            console.log("click settings");
        });
    }

    show() { // 显示menu界面
        this.$menu.show();
    }

    hide() { // 关闭menu界面
        this.$menu.hide();
    }
}let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.calledStart = false; //是否执行过start（）函数
        this.timedelta = 0; //当前帧与上一帧的时间差
    }

    start() { return !this.calledStart; } //初始帧

    // update(timeStamp) { this.timedelta = timeStamp - lastTimeStamp; } 
    //更新时间间隔，用一行版的时候用这个函数

    update() { // 更新每一帧
    }

    finalize() { //对象被销毁前的析构任务
    }

    destroy() {
        this.finalize();

        for (let i = 0; i < GAME_OBJECTS.length; i++) {
            if (this === GAME_OBJECTS[i]) {
                GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let lastTimeStamp;

let GAME_ANIMATION = function(timeStamp) {
    for (let i = 0; i < GAME_OBJECTS.length; i++) {
        let obj = GAME_OBJECTS[i];
        // obj.timeStamp = calledStart ? !calledStart ? obj.start() : obj.update(timeStamp) : 0;
        //终极炫技一行顶七行，上面这一行等于下面的几行，看不懂就别用

        if (!obj.calledStart) {
            obj.start();
            obj.calledStart = true;
        } else {
            obj.timedelta = timeStamp - lastTimeStamp;
            obj.update();
        }
    }
    lastTimeStamp = timeStamp;

    requestAnimationFrame(GAME_ANIMATION); //递归执行这个函数
}

requestAnimationFrame(GAME_ANIMATION);class GameMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {}

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class Player extends GameObject {
    constructor(playground, id, x, y, radius, color, speed, myself) {
        super();
        this.playground = playground;
        this.id = id;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.moveLength = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.myself = myself;
        this.eps = 0.1;
        this.curSkill = 0; //q : 1, w : 2, e : 3, r : 4, d : 5, f : 6
        // this.mouseX = 0;
        // this.mouseY = 0;用于实现快捷施法....目前还做不到高效地实现，要是每次鼠标移动就记录坐标那太吃性能了=。=
    }

    start() {
        if (this.myself) {
            this.add_listening_event();
        } else {
            this.ai_move();
        }
    }

    ai_move() {
        let x = Math.random() * this.playground.width;
        let y = Math.random() * this.playground.height;
        this.move_to(x, y);
    }

    add_listening_event() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (e.which === 3) {
                outer.move_to(e.clientX, e.clientY);
            } else if (e.which === 1) {
                switch (outer.curSkill) {
                    case 1: //释放q技能
                        console.log("press Q");
                        let lenx = e.clientX - outer.x;
                        let leny = e.clientY - outer.y;
                        let moveLength = Math.sqrt(lenx * lenx + leny * leny); //计算两点之间的距离
                        let vx = lenx / moveLength;
                        let vy = leny / moveLength;
                        new FireBall(
                            outer.playground,
                            outer.id,
                            outer.x,
                            outer.y,
                            outer.playground.height * 0.015,
                            "red",
                            outer.speed * 2,
                            vx,
                            vy,
                            outer.playground.height * 0.65,
                        );
                        break;
                    case 2:
                        console.log("press W");
                        break;
                    case 3:
                        console.log("press E");
                        break;
                    default:
                }
                outer.curSkill = 0;
            }
        });

        // this.playground.game_map.$canvas.mousemove(function(e) {
        //     outer.mouseX = e.clientX;
        //     outer.mouseY = e.clientY;
        //     // console.log(e.clientX);
        // })

        $(window).keydown(function(e) {
            switch (e.which) {
                case 81: //q
                    outer.curSkill = 1;
                    break;
                case 87: //w
                    outer.curSkill = 2;
                    break;
                case 69: //e
                    outer.curSkill = 3;
                    break;
                case 82: //r
                    outer.curSkill = 4;
                    break;
                case 68: //d
                    outer.curSkill = 5;
                    break;
                case 70: //f
                    outer.curSkill = 6;
                    break;
                case 83: //s
                    outer.vx = outer.vy = 0;
                    break;
                default:
            }
        });
    }

    move_to(x, y) {
        let lenx = x - this.x;
        let leny = y - this.y;
        this.moveLength = Math.sqrt(lenx * lenx + leny * leny); //计算两点之间的距离
        this.vx = lenx / this.moveLength;
        this.vy = leny / this.moveLength;
    }

    update() {
        if (this.moveLength < this.eps) {
            this.moveLength = 0;
            if (this.myself)
                this.vx = this.vy = 0;
            else
                this.ai_move();
        } else {
            //更新球的坐标
            let SPEED = Math.min(this.moveLength, this.speed * this.timedelta * 0.001)
            this.x += this.vx * SPEED;
            this.y += this.vy * SPEED;
            this.moveLength -= SPEED;
        }

        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class FireBall extends GameObject {
    constructor(playground, id, x, y, radius, color, speed, vx, vy, moveLength) {
        super();
        this.playground = playground;
        this.id = id; //储存发射者的ID在遍历players的时候判断ID是否一致来避免自己打死自己
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.moveLength = moveLength;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.eps = 0.1;
    }

    start() {

    }

    check_damage() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player.id != this.id) {
                let lenx = player.x - this.x;
                let leny = player.y - this.y;
                let distance = Math.sqrt(lenx * lenx + leny * leny);
                if (distance < this.radius + player.radius) { //命中！！
                    player.destroy();
                    this.destroy();
                    break;
                }
            }
        }
    }


    update() {
        if (this.moveLength < this.eps) {
            this.destroy();
            return false;
        } else {
            //检测是否命中敌人
            this.check_damage();
            //更新球的坐标
            let SPEED = Math.min(this.moveLength, this.speed * this.timedelta * 0.001)
            this.x += this.vx * SPEED;
            this.y += this.vy * SPEED;
            this.moveLength -= SPEED;
        }

        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game_playground"></div>`);

        // this.hide();
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(
            this, 258 /*id*/ ,
            this.width / 2,
            this.height / 2,
            this.height * 0.05,
            "green",
            this.height * 0.20,
            true
        ));
        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(
                this, i /*id*/ ,
                this.width / 2,
                this.height / 2,
                this.height * 0.05,
                "yellow",
                this.height * 0.20,
                false
            ));
        }

        this.start();
    }

    start() {}

    show() { // 打开playground界面
        this.$playground.show();
    }

    hide() { // 关闭playground界面
        this.$playground.hide();
    }
}//总的main.js
export class Game {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);
        // this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }

    start() {}
}class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
    <div class="game_menu">
        <div class="game_menu-field">
            <div class="game_menu-field-item game_menu-field-item-single-mode">
                单人模式
            </div>
            <br>
            <div class="game_menu-field-item game_menu-field-item-multi-mode">
                多人模式
            </div>
            <br>
            <div class="game_menu-field-item game_menu-field-item-settings">
                设置
            </div>
        </div>
    </div>
    `);
        this.root.$game.append(this.$menu);
        this.$single_mode = this.$menu.find('.game_menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.game_menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.game_menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function() {
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function() {
            console.log("click multi mode");
        });
        this.$settings.click(function() {
            console.log("click settings");
        });
    }

    show() { // 显示menu界面
        this.$menu.show();
    }

    hide() { // 关闭menu界面
        this.$menu.hide();
    }
}let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.calledStart = false; //是否执行过start（）函数
        this.timedelta = 0; //当前帧与上一帧的时间差
    }

    start() { return !this.calledStart; } //初始帧

    // update(timeStamp) { this.timedelta = timeStamp - lastTimeStamp; } 
    //更新时间间隔，用一行版的时候用这个函数

    update() { // 更新每一帧
    }

    finalize() { //对象被销毁前的析构任务
    }

    destroy() {
        this.finalize();

        for (let i = 0; i < GAME_OBJECTS.length; i++) {
            if (this === GAME_OBJECTS[i]) {
                GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let lastTimeStamp;

let GAME_ANIMATION = function(timeStamp) {
    for (let i = 0; i < GAME_OBJECTS.length; i++) {
        let obj = GAME_OBJECTS[i];
        // obj.timeStamp = calledStart ? !calledStart ? obj.start() : obj.update(timeStamp) : 0;
        //终极炫技一行顶七行，上面这一行等于下面的几行，看不懂就别用

        if (!obj.calledStart) {
            obj.start();
            obj.calledStart = true;
        } else {
            obj.timedelta = timeStamp - lastTimeStamp;
            obj.update();
        }
    }
    lastTimeStamp = timeStamp;

    requestAnimationFrame(GAME_ANIMATION); //递归执行这个函数
}

requestAnimationFrame(GAME_ANIMATION);class GameMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {}

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class Player extends GameObject {
    constructor(playground, id, x, y, radius, color, speed, myself) {
        super();
        this.playground = playground;
        this.id = id;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.moveLength = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.myself = myself;
        this.eps = 0.1;
        this.curSkill = 0; //q : 1, w : 2, e : 3, r : 4, d : 5, f : 6
        // this.mouseX = 0;
        // this.mouseY = 0;用于实现快捷施法....目前还做不到高效地实现，要是每次鼠标移动就记录坐标那太吃性能了=。=
    }

    start() {
        if (this.myself) {
            this.add_listening_event();
        } else {
            this.ai_move();
        }
    }

    ai_move() {
        let x = Math.random() * this.playground.width;
        let y = Math.random() * this.playground.height;
        this.move_to(x, y);
    }

    add_listening_event() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (e.which === 3) {
                outer.move_to(e.clientX, e.clientY);
            } else if (e.which === 1) {
                switch (outer.curSkill) {
                    case 1: //释放q技能
                        console.log("press Q");
                        let lenx = e.clientX - outer.x;
                        let leny = e.clientY - outer.y;
                        let moveLength = Math.sqrt(lenx * lenx + leny * leny); //计算两点之间的距离
                        let vx = lenx / moveLength;
                        let vy = leny / moveLength;
                        new FireBall(
                            outer.playground,
                            outer.id,
                            outer.x,
                            outer.y,
                            outer.playground.height * 0.015,
                            "red",
                            outer.speed * 2,
                            vx,
                            vy,
                            outer.playground.height * 0.65,
                        );
                        break;
                    case 2:
                        console.log("press W");
                        break;
                    case 3:
                        console.log("press E");
                        break;
                    default:
                }
                outer.curSkill = 0;
            }
        });

        // this.playground.game_map.$canvas.mousemove(function(e) {
        //     outer.mouseX = e.clientX;
        //     outer.mouseY = e.clientY;
        //     // console.log(e.clientX);
        // })

        $(window).keydown(function(e) {
            switch (e.which) {
                case 81: //q
                    outer.curSkill = 1;
                    break;
                case 87: //w
                    outer.curSkill = 2;
                    break;
                case 69: //e
                    outer.curSkill = 3;
                    break;
                case 82: //r
                    outer.curSkill = 4;
                    break;
                case 68: //d
                    outer.curSkill = 5;
                    break;
                case 70: //f
                    outer.curSkill = 6;
                    break;
                case 83: //s
                    outer.vx = outer.vy = 0;
                    break;
                default:
            }
        });
    }

    move_to(x, y) {
        let lenx = x - this.x;
        let leny = y - this.y;
        this.moveLength = Math.sqrt(lenx * lenx + leny * leny); //计算两点之间的距离
        this.vx = lenx / this.moveLength;
        this.vy = leny / this.moveLength;
    }

    update() {
        if (this.moveLength < this.eps) {
            this.moveLength = 0;
            if (this.myself)
                this.vx = this.vy = 0;
            else
                this.ai_move();
        } else {
            //更新球的坐标
            let SPEED = Math.min(this.moveLength, this.speed * this.timedelta * 0.001)
            this.x += this.vx * SPEED;
            this.y += this.vy * SPEED;
            this.moveLength -= SPEED;
        }

        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class FireBall extends GameObject {
    constructor(playground, id, x, y, radius, color, speed, vx, vy, moveLength) {
        super();
        this.playground = playground;
        this.id = id; //储存发射者的ID在遍历players的时候判断ID是否一致来避免自己打死自己
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.moveLength = moveLength;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.eps = 0.1;
    }

    start() {

    }

    check_damage() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player.id != this.id) {
                let lenx = player.x - this.x;
                let leny = player.y - this.y;
                let distance = Math.sqrt(lenx * lenx + leny * leny);
                if (distance < this.radius + player.radius) { //命中！！
                    this.playground.players.spice(i, 1);
                    this.destroy();
                    break;
                }
            }
        }
    }


    update() {
        if (this.moveLength < this.eps) {
            this.destroy();
            return false;
        } else {
            //检测是否命中敌人
            this.check_damage();
            //更新球的坐标
            let SPEED = Math.min(this.moveLength, this.speed * this.timedelta * 0.001)
            this.x += this.vx * SPEED;
            this.y += this.vy * SPEED;
            this.moveLength -= SPEED;
        }

        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game_playground"></div>`);

        // this.hide();
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(
            this, 258 /*id*/ ,
            this.width / 2,
            this.height / 2,
            this.height * 0.05,
            "green",
            this.height * 0.20,
            true
        ));
        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(
                this, i /*id*/ ,
                this.width / 2,
                this.height / 2,
                this.height * 0.05,
                "yellow",
                this.height * 0.20,
                false
            ));
        }

        this.start();
    }

    start() {}

    show() { // 打开playground界面
        this.$playground.show();
    }

    hide() { // 关闭playground界面
        this.$playground.hide();
    }
}//总的main.js
export class Game {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);
        // this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }

    start() {}
}