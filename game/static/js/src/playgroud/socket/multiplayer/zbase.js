class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.uuid = this.playground.players[0].uuid;
        this.ws = new WebSocket("wss://app1179.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }

    receive() {
        let outer = this;

        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;
            let event = data.event;
            switch (event) {
                case "create_player":
                    //onmessage函数用于接受连接成功的服务器发来的消息或数据
                    //(后进入房间的玩家会在connect函数中就收到消息，然后创建出原先就存在的几位玩家
                    //而先进入的玩家会在后进入的玩家的前端执行send_create_player函数之后
                    //才会收到这位新玩家的信息意用于在自己的前端创建这位新玩家)
                    outer.receive_create_player(uuid, data.username, data.photo);
                    break;
                case "move_to":
                    outer.receive_move_to(uuid, data.x, data.y, data.vx, data.vy, data.moveLength);
                    break;
                case "shoot_fire_ball":
                    outer.receive_shoot_fire_ball(uuid, data.mouse_x, data.mouse_y, data.offset_x, data.offset_y);
                    break;
                case "move_stop":
                    outer.receive_move_stop(uuid);
                    break;
                case "burst":
                    outer.receive_burst(uuid, data.mouse_x, data.mouse_y);
                    break;
                case "shield":
                    outer.receive_shield(uuid);
                    break;
                case "hit_player":
                    outer.receive_hit_player(uuid, damage, vx, vy);
                    break;
                default:
            }
        }
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            HP,
            this.playground.camare_width / 2 / this.playground.scale,
            0.5,
            PLAYER_RADIUS,
            "green",
            PLAYER_SPEED,
            ENERMY,
            username,
            photo
            //敌人
        )
        player.uuid = uuid;
        this.playground.players.push(player);
    }

    send_move_to(uuid, x, y, vx, vy, moveLength) {
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': uuid,
            'x': x,
            'y': y,
            'vx': vx,
            'vy': vy,
            'moveLength': moveLength
        }));
    }

    get_player_by_uuid(uuid) {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player.uuid === uuid)
                return player;
        }
        return null;
    }

    receive_move_to(uuid, x, y, vx, vy, moveLength) {
        let player = this.get_player_by_uuid(uuid);
        if (player) {
            player.x = x, player.y = y; //更新该玩家的原始坐标
            player.vx = vx, player.vy = vy; //需要移动的方向与距离在广播消息前已经算好
            player.moveLength = moveLength;
        }
    }

    send_shoot_fire_ball(uuid, mouse_x, mouse_y, offset_x, offset_y) {
        this.ws.send(JSON.stringify({
            'event': "shoot_fire_ball",
            'uuid': uuid,
            'mouse_x': mouse_x,
            'mouse_y': mouse_y,
            'offset_x': offset_x,
            'offset_y': offset_y
        }));
    }

    receive_shoot_fire_ball(uuid, mouse_x, mouse_y, offset_x, offset_y) {
        let player = this.get_player_by_uuid(uuid);
        if (player) {
            player.cur_skill = 1;
            player.unleash_skills(mouse_x, mouse_y, offset_x, offset_y);
        }
    }

    send_burst(uuid, mouse_x, mouse_y) {
        this.ws.send(JSON.stringify({
            'event': "burst",
            'uuid': uuid,
            'mouse_x': mouse_x,
            'mouse_y': mouse_y,
        }));
    }

    receive_burst(uuid, mouse_x, mouse_y) {
        let player = this.get_player_by_uuid(uuid);
        if (player) {
            player.cur_skill = 3;
            player.unleash_skills(mouse_x, mouse_y);
        }
    }

    send_move_stop(uuid) {
        this.ws.send(JSON.stringify({
            'event': "move_stop",
            'uuid': uuid
        }));
    }

    receive_move_stop(uuid) {
        let player = this.get_player_by_uuid(uuid);
        if (player) {
            player.moveLength = 0;
        }
    }

    send_shield(uuid) {
        this.ws.send(JSON.stringify({
            'event': "shield",
            'uuid': uuid
        }));
    }

    receive_shield(uuid) {
        let player = this.get_player_by_uuid(uuid);
        if (player) {
            player.shield = true;
        }
    }

    send_hit_player(uuid, damage, vx, vy) {
        this.ws.send(JSON.stringify({
            'event': "hit_player",
            'uuid': uuid,
            'damage': damage,
            'vx': vx,
            'vy': vy
        }));
    }

    receive_hit_player(uuid, damage, vx, vy) {
        let player = this.get_player_by_uuid(uuid);
        if (player) {
            player.be_hit(damage, vx, vy);
        }
    }
}