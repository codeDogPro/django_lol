from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache


class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        #接受客户端与服务器接受连接前所写的判断逻辑
        self.room_name = None
        for i in range(1000):
            name = "room-%i" %(i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        
        if not self.room_name:
            return 
        #接受连接
        await self.accept()
        
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600) #每个房间的最大游戏时长为一小时
            
        for player in cache.get(self.room_name):
            await self.send(text_data = json.dumps({#将这个房间中原有的玩家的信息发送给新进入房间的玩家
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo']
            }))
        
        #这个函数的第二个参数才是被加入者的id,前一个参数是表示向groups数组中添加一个元素group，
        #同时按组存储也为了组内群发消息提供了支持，
        #当某个玩家断开连接时会遍历groups数组来删除这个玩家的channel_name。   
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

       
    async def group_send_event(self, data):#消息群发函数
        await self.send(text_data = json.dumps(data))

    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo']
        })
        cache.set(self.room_name, players, 3600)#再将该房间内的players信息更新回Redis
        
        await self.channel_layer.group_send(#将新玩家的信息群发给房间内的其他玩家
            self.room_name,    
            {
                'type': "group_send_event",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo']
            }
        )
        
    async def move_to(self, data):
        await self.channel_layer.group_send(#把移动信息群发给房间内的所有玩家
            self.room_name,
            {   
                'type': "group_send_event",
                'event': "move_to",
                'uuid': data['uuid'],
                'x': data['x'],
                'y': data['y'],
                'vx': data['vx'],
                'vy': data['vy'],
                'moveLength': data['moveLength']
            }
        )
     
    async def shoot_fire_ball(self, data):
        await self.channel_layer.group_send(#把发射火球信息群发给房间内的所有玩家
            self.room_name,
            {
                'type': "group_send_event",
                'event': "shoot_fire_ball",
                'uuid': data['uuid'],
                'mouse_x': data['mouse_x'],
                'mouse_y': data['mouse_y'],
                'offset_x': data['offset_x'],
                'offset_y': data['offset_y']
            }
        ) 
    
    async def move_stop(self, data):
        await self.channel_layer.group_send(#把移动停止信息群发给房间内的所有玩家
            self.room_name,
            {
                'type': "group_send_event",
                'event': "move_stop",
                'uuid': data['uuid']
            }
        ) 
 
    async def burst(self, data):
        await self.channel_layer.group_send(#把进行突进信息群发给房间内的所有玩家
            self.room_name,
            {
                'type': "group_send_event",
                'event': "burst",
                'uuid': data['uuid'],
                'mouse_x': data['mouse_x'],
                'mouse_y': data['mouse_y']
            }
        ) 
         
    async def shield(self, data):
        await self.channel_layer.group_send(#把使用护盾信息群发给房间内的所有玩家
            self.room_name,
            {
                'type': "group_send_event",
                'event': "shield",
                'uuid': data['uuid'],
            }
        )     
        
    async def hit_player(self,data):
        await self.channel_layer.group_send(#把击中某名玩家群发给房间内的所有玩家
            self.room_name,
            {
                'type': "group_send_event",
                'event': "hit_player",
                'uuid': data['uuid'],
                'damage': data['damage'],
                'vx': data['vx'],
                'vy': data['vy']
            }
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        #要优化成switch的形式
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fire_ball":
            await self.shoot_fire_ball(data)
        elif event == "move_stop":
            await self.move_stop(data)
        elif event == "burst":
            await self.burst(data)
        elif event == "shield":
            await self.shield(data)
        elif event == "hit_player":
            await self.hit_player(data)
        #print(data)