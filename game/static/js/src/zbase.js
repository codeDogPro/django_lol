//总的main.js
export class Game {
    constructor(id, AcWingOS) {
        this.id = id;
        this.AcWingOS = AcWingOS;
        this.$game = $('#' + id);

        this.settings = new Settings(this);

        this.menu = new GameMenu(this);

        this.playground = new GamePlayground(this);

        this.start();
    }

    start() {}
}