class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";

        this.$settings = $(`
        <div class = "game_settings">
            <div class = "game_settings-login">
                <div class = "game_settings-title">
                    登 录
                </div>

                <div class = "game_settings-username">
                    <div class = "game_settings-item">
                        <input type = "text" placeholder = "用户名">
                    </div>
                </div>

                <div class = "game_settings-password">
                    <div class = "game_settings-item">
                        <input type = "password" placeholder = "密码">
                    </div>
                </div>

                <div class = "game_settings-submit">
                    <div class = "game_settings-item">
                        <button>登 录</button>
                    </div>
                </div>

                <div class = "game_settings-erro-messages">
                </div>

                <div class = "game_settings-option">
                    注册
                </div>
                <br>
                <div class = "game_settings-acwing">
                    <img width = "40" 
                        src = "https://app1179.acapp.acwing.com.cn/static/image/settings/acwing_logo.png"
                    >
                </div>
            </div>

            <div class = "game_settings-register">
                <div class = "game_settings-title">
                    注册
                </div>

                <div class = "game_settings-username">
                    <div class = "game_settings-item">
                    <input type = "text" placeholder = "用户名">
                    </div>
                </div>

                <div class = "game_settings-password password_first">
                    <div class = "game_settings-item">
                        <input type = "password" placeholder = "密码">
                    </div>
                </div>
                
                <div class = "game_settings-password password_second">
                    <div class = "game_settings-item">
                        <input type = "password" placeholder = "确认密码">
                    </div>
                </div>

                <div class = "game_settings-submit">
                    <div class = "game_settings-item">
                        <button>注 册</button>
                    </div>
                </div>

                <div class = "game_settings-erro-messages">
                </div>

                <div class = "game_settings-option">
                    登录
                </div>
            </div>    
        </div>
        `);
        this.$login = this.$settings.find(".game_settings-login");
        this.$login.hide();
        this.$login_username = this.$login.find(".game_settings-username input");
        this.$login_password = this.$login.find(".game_settings-password input");
        this.$login_submit = this.$login.find(".game_settings-submit button");
        this.$login_erro = this.$login.find(".game_settings-erro-messages");
        this.$login_register = this.$login.find(".game_settings-option");
        this.$login_acwing = this.$login.find(".game_settings-acwing img");

        this.$register = this.$settings.find(".game_settings-register");
        this.$register.hide();
        this.$register_username = this.$register.find(".game_settings-username input");
        this.$register_password = this.$register.find(".password_first input");
        this.$register_password_again = this.$register.find(".password_second input");
        this.$register_submit = this.$register.find(".game_settings-submit button");
        this.$register_erro = this.$register.find(".game_settings-erro-messages");
        this.$register_login = this.$register.find(".game_settings-option");

        this.root.$game.append(this.$settings);
        this.start();
    }

    start() {
        if (this.platform === "ACAPP") {
            console.log("in acapp");
            this.getinfo_acapp();
        } else { //只有在web端才需要添加监听事件
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events() {
        this.add_login_listening_events();
        this.add_register_listening_events();
    }

    add_login_listening_events() {
        let outer = this;
        this.$login_register.click(function() {
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_remote();
        });
        this.$login_acwing.click(function() {
            outer.login_acwing_in_web();
        });
    }

    add_register_listening_events() {
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_remote();
        })
    }

    login_remote() {
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_erro.empty();

        $.ajax({
            url: "https://app1179.acapp.acwing.com.cn/settings/signin/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_erro.html(resp.result);
                }
            }
        });
    }

    login_acwing_in_web() {
        $.ajax({
            url: "https://app1179.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    /*
                    从apply_code()函数中返回，然后再跳转到acwing的授权界面
                    同意登录后会根据apply_code()中的redirect_uri去调用receive_code()函数
                    再由此函数完成access——token的申请和userinfo的获取，然后此函数继续与Django的数据库对接
                    查询是否此用户已经登录过，没有的话就进行注册，至此acwing一键登录逻辑结束
                    */
                    window.location.replace(resp.apply_code_url);
                } else {
                    console.log("erro");
                }
            }
        })
    }

    login_acwing_in_acapp(app_id, redirect_uri, scope, state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(app_id, redirect_uri, scope, state, function(resp) {
            if (resp.result === "success") {
                console.log(resp);
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            } else {
                console.log("登录失败");
            }
        });
    }

    logout_remote() {
        if (this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close();
        } else {
            $.ajax({
                url: "https://app1179.acapp.acwing.com.cn/settings/signout/",
                type: "GET",
                success: function(resp) {
                    if (resp.result === "success")
                        location.reload();
                }
            });
        }
    }

    register_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_again = this.$register_password_again.val();
        this.$register_erro.empty();
        $.ajax({
            url: "https://app1179.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_again: password_again,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_erro.html(resp.result);
                }
            }
        })
    }

    login() { //打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    register() { //打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    getinfo_acapp() {
        let outer = this;

        $.ajax({
            url: "https://app1179.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    outer.login_acwing_in_acapp(resp.app_id, resp.redirect_uri, resp.scope, resp.state);
                } else {
                    console.log("fail to getinfo from acapp");
                }
            }
        })
    }

    getinfo_web() {
        let outer = this;
        $.ajax({
            url: "https://app1179.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform
            },
            success: function(resp) {
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }


    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}