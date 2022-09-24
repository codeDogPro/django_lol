let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.called_start = false; //是否执行过start（）函数
        this.time_delta = 0; //当前帧与上一帧的时间差
        this.uuid = this.create_uuid();
    }

    create_uuid() {
        let id = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            id += x;
        }
        return id;
    }

    start() { return !this.called_start; } //初始帧

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

let last_time_stamp;

let GAME_ANIMATION = function(time_stamp) {
    for (let i = 0; i < GAME_OBJECTS.length; i++) {
        let obj = GAME_OBJECTS[i];

        if (!obj.called_start) {
            obj.start();
            obj.called_start = true;
        } else {
            obj.time_delta = time_stamp - last_time_stamp;
            obj.update();
        }
    }
    last_time_stamp = time_stamp;

    requestAnimationFrame(GAME_ANIMATION); //递归执行这个函数
}

requestAnimationFrame(GAME_ANIMATION);