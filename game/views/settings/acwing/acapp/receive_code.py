from django.http import JsonResponse
from django.core.cache  import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from random import randint

def receive_code(request):
    data = request.GET
    if "errcode" in data:
        return JsonResponse({
            'result': "apply failed",
            'errcode': data.get('errcode'),
            'errmsg': data.get('errmsg')
        })
    code = data.get('code') 
    state = data.get('state')
    
    if not cache.has_key(state):
        return JsonResponse({'result': "this state doesn't exists"})       
    cache.delete(state)    
    
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': "1179",
        'secret': "8ef4eec9b1a64dee8b76baacdd3bc730",
        'code': code,
    }
    apply_access_token_res = requests.get(apply_access_token_url, params=params).json()
    
    access_token = apply_access_token_res['access_token']
    openid = apply_access_token_res['openid']
    players = Player.objects.filter(openid = openid)
    if players.exists():
        #在acapp中如果用户已经一键登陆过，则直接把用户信息传回前端的login_acwing_in_acapp()函数中的回调函数中
        player = players[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })
    
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'access_token': access_token,
        'openid': openid
    }
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']
    #生成一个唯一的用户名
    while User.objects.filter(username = username).exists():
        username += str(randint(0, 9))
    
    user = User.objects.create(username = username)
    player = Player.objects.create(user = user, photo = photo, openid = openid)
    return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })