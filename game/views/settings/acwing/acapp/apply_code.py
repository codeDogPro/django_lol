from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    app_id = "1179"
    #下一行的uri是acwing返回code是请求的地址
    redirect_uri = quote("https://app1179.acapp.acwing.com.cn/settings/acwing/acapp/receive_code/")
    scope = "userinfo"
    state = get_state()
    #有效期两小时
    cache.set(state, True, 7200) 
    return JsonResponse({
        'result': "success",
        'app_id': app_id,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })