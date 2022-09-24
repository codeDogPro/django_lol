from django.urls import path,include
from game.views.settings.getinfo import getinfo
from game.views.settings.signin import signin
from game.views.settings.signout import signout
from game.views.settings.register import register

urlpatterns = [
    path("getinfo/", getinfo, name = "settings_getinfo"),
    path("signin/", signin, name = "settings_signin"),
    path("signout/", signout, name = "settings_signout"),
    path("register/", register, name = "settings_register"),
    path("acwing/",include("game.urls.settings.acwing.index")),
]
