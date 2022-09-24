let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.calledStart = false; //是否执行过start（）函数
        this.timedelta = 0; //当前帧与上一帧的时间差
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

requestAnimationFrame(GAME_ANIMATION);