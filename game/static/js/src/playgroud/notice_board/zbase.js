class NoticeBoard extends UnmovableGameObject {
    constructor(playground, x, y) {
        super(x, y);
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "存活：";
        this.size = 0.036;
        this.count_down = 0;
    }

    start() {

    }

    update_text(text) {
        this.text = text;
    }

    update() {
        if (this.count_down++ > 60) {
            //每秒更新一次
            this.count_down = 0;
            this.update_text("存活：" + this.playground.players.length + " 人");
        }
        this.render();
    }

    render() {
        let size = this.size * this.playground.scale;
        this.ctx.font = size + "px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.x * this.playground.scale, this.y * this.playground.scale);
    }
}