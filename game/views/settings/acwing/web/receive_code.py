from curses import getsyx
from django.shortcuts import redirect
from django.core.cache  import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint

def receive_code(request):
    data = request.GET
    code = data.get('code') 
    state = data.get('state')
    
    if not cache.has_key(state):
        return redirect("index")
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
        #如果用户已经登录过，则不去acwing中再申请用户信息,直接登录
        login(request, players[0].user)
        return redirect("index")
    
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
    Player.objects.create(user = user, photo = photo, openid = openid)
    login(request, user) 
    
    # index是root（这个游戏）的域名，在最外层的index.py文件中定义的
    return redirect("index")