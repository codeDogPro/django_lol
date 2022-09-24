const CDS = [75, 300, 180];
const MAX_NUM = [7, 1, 1];

class CD {
    constructor(playground) {
        this.playground = playground;
        this.ctx = playground.game_map.ctx;
        this.count = 0;
        //当前可使用的技能次数
        this.readyed_num = [5, 1, 1];
        this.accumulations = [0, 0, 0];
        this.imgs = [];
        this.picture_radius = 0.033;
        //只需要存横坐标，纵坐标都是一样的
        this.position = [0.78, 0.88, 0.98];
        this.init_img();
    }

    init_img() {
        for (let i = 0; i < 3; i++) {
            this.imgs.push(new Image());
        }
        //0:火球 1:护盾 2:突进
        this.imgs[0].src = "https://bpic.588ku.com/element_origin_min_pic/19/03/07/95a5fd8118dbf18d1521d9bbd1f72662.jpg";
        this.imgs[1].src = "https://img.ixintu.com/download/jpg/201912/3450fb5dea895bda9ee643e32e867a14.jpg!ys";
        this.imgs[2].src = "https://game.gtimg.cn/images/lol/act/img/spell/UFSlash.png";
    }

    unleash_fire_ball_request() {
        if (--this.readyed_num[0] >= 0)
            return true;
        this.readyed_num[0] = 0;
        return false;
    }
    unleash_shield_request() {
        if (--this.readyed_num[1] >= 0)
            return true;
        this.readyed_num[1] = 0;
        return false;
    }
    unleash_burst_request() {
        if (--this.readyed_num[2] >= 0)
            return true;
        this.readyed_num[2] = 0;
        return false;
    }

    add_accumulation() {
        for (let i = 0; i < 3; i++) {
            this.accumulations[i] = this.readyed_num[i] < MAX_NUM[i] ? this.accumulations[i] + 6 : 0;
            if (this.accumulations[i] >= CDS[i]) {
                this.readyed_num[i]++;
                this.accumulations[i] = 0;
            }
        }
    }

    update_cd() {
        //每秒执行10次
        if (this.count++ > 5) {
            this.count = 0;
            this.add_accumulation();
        }
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let radius = this.picture_radius * scale;;
        let y = 0.85 * this.playground.scale;
        for (let i = 0; i < 3; i++) {
            //渲染技能图标
            let x = this.position[i] * this.playground.scale;
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            this.ctx.strokeStyle = "orange";
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.imgs[i], x - radius, y - radius, radius * 2, radius * 2);
            this.ctx.restore();
            //渲染cd
            if (this.readyed_num[i] < MAX_NUM[i]) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2 * (1 - this.accumulations[i] / CDS[i]), false);
                this.ctx.fillStyle = "#0a5079";
                this.ctx.fill();
            }
        }
        //显示火球存储个数
        this.ctx.font = "px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(parseInt(this.readyed_num[0]), this.position[0] * scale + radius, y + radius);
    }
}