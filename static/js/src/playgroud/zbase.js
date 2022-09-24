const HP = 20;
const PLAYER_SPEED = 0.16;
const PLAYER_RADIUS = 0.045;
const FIRE_BALL_SPEED = PLAYER_SPEED * 2;
const PARTICLE_SPEED = PLAYER_SPEED * 15;
const ROBOT_SPEED = 0.12;
const BLOOD_PACKS_SPEED = 1.0;
const ME = 1;
const ROBOT = 2;
const ENERMY = 3;
const SINGLE_MODE = 1;
const MULTI_MODE = 2;
const FIRE_BALL_LARGEN_SPEED = 1.04;
const FIRE_BALL_SMALLEN_SPEED = 0.985;
const GENERATE_REWARDS_MOVELENGTH = 0.2;

class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game_playground"></div>`);

        this.root.$game.append(this.$playground);
        this.hide();

        this.start();
    }

    update_offset(moved_x, moved_y, radius) {
        //所有物体相对于我的偏移，即我不动，我点击鼠标之后计算出移动量然后让所有物体加上这个偏移量
        if (Math.abs((this.offset_x + moved_x + radius) * this.scale) < this.camare_width * 2 &&
            Math.abs((this.offset_y + moved_y + radius) * this.scale) < this.camare_height * 2) {
            this.offset_x += moved_x;
            this.offset_y += moved_y;
        }
        // console.log(moved_x, moved_y, this.offset_x, this.offset_y);
    }

    check_in_camare(obj_x, obj_y, obj_radius) {
        //在相机中的物体才会提交渲染
        let x1 = obj_x + obj_radius;
        let y1 = obj_y + obj_radius;
        let x2 = obj_x - obj_radius;
        let y2 = obj_y - obj_radius;
        // console.log(x1, y1, x2, y2, this.playground.camare_x1);
        return x1 > this.camare_x1 && y1 > this.camare_y1 &&
            x2 < this.camare_x2 && y2 < this.camare_y2;
    }

    resize() {
        //整个地图的宽高  面积是相机面积的九倍,
        this.width = this.$playground.width() * 5;
        this.height = this.$playground.height() * 5;
        this.camare_width = this.$playground.width();
        this.camare_height = this.$playground.height();
        //左上顶点，自己移动的时候会实时更新这四个值
        this.camare_x1 = 0;
        this.camare_y1 = 0;
        //右下顶点
        this.camare_x2 = this.$playground.width();
        this.camare_y2 = this.$playground.height();

        // console.log("w: " + this.width, "h: " + this.height);
        // console.log("cw: " + this.camare_width, "ch: " + this.camare_height);
        // console.log("x1: " + this.camare_x1, "x2: " + this.camare_x2);

        let unit = Math.min(this.camare_width / 16, this.camare_height / 9);
        this.camare_width = unit * 16;
        this.camare_height = unit * 9;
        this.scale = this.camare_height;

        if (this.game_map) this.game_map.resize();
    }

    start() {
        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });
    }

    show(difficulty = 1, game_mode, map_mode = "big_map") { // 打开playground界面
        this.difficulty = difficulty;
        this.game_mode = game_mode;
        this.map_mode = map_mode;
        this.offset_x = 0;
        this.offset_y = 0;
        this.difficulty;
        this.resize();

        this.game_map = new GameMap(this);
        this.notice_board = new NoticeBoard(this, 0.15, 0.08);


        this.players = [];
        //创建玩家
        if (game_mode == SINGLE_MODE) {
            for (let i = 0; i < 40; i++) {
                let color = Funcions.make_color();
                this.players.push(new Player(
                    this,
                    HP,
                    this.width * Math.random() / this.scale,
                    Math.random(),
                    PLAYER_RADIUS,
                    color,
                    ROBOT_SPEED,
                    ROBOT,
                    "sharco"
                    //人机
                ));
            }
        }
        this.players.push(new Player(
            this,
            HP,
            this.camare_width / 2 / this.scale,
            0.5,
            PLAYER_RADIUS,
            "green",
            PLAYER_SPEED,
            ME,
            this.root.settings.username,
            this.root.settings.photo
            //最后创建自己
        ));

        if (game_mode == MULTI_MODE) {
            this.mps = new MultiPlayerSocket(this);

            let outer = this;
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }

        this.$playground.show();
    }

    hide() { // 关闭playground界面
        this.$playground.hide();
    }
}