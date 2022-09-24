class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
        <div class="game_menu" id = "menu">
            <div class="game_menu-field" id = "menu-field">
                <div class="game_menu-field-item game_menu-field-item-single-mode" id = "single-mode">
                    单人模式
                </div>
                <br>
                <div class="game_menu-field-item game_menu-field-item-multi-mode" id = "multi-mode">
                    多人模式
                </div>
                <br>
                <div class="game_menu-field-item game_menu-field-item-settings" id = "settings">
                    退出
                </div>
            </div>
            <div class="game_menu-field" id = "difficulty-menu">
                <div class="game_menu-field-item game_menu-field-item-easy" id = "easy">
                    简易模式
                </div>
                <br>
                <div class="game_menu-field-item game_menu-field-item-normal" id = "normal">
                    一般模式
                </div>
                <br>
                <div class="game_menu-field-item game_menu-field-item-hard" id = "hard">
                    困难模式
                </div>
                <br>
                <div class="game_menu-field-item game_menu-field-item-back" id = "back">
                    返回
                </div>
            </div>
        </div>
        `);

        //先隐藏菜单，登陆成功之后才显示
        this.$menu.hide();

        this.root.$game.append(this.$menu);

        this.$single_mode = this.$menu.find('.game_menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.game_menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.game_menu-field-item-settings');
        this.$easy = this.$menu.find('.game_menu-field-item-easy');
        this.$normal = this.$menu.find('.game_menu-field-item-normal');
        this.$hard = this.$menu.find('.game_menu-field-item-hard');
        this.$back = this.$menu.find('.game_menu-field-item-back');

        this.menus = document.getElementById("menu");
        this.menu_field = document.getElementById("menu-field");
        this.difficulty_menu = document.getElementById("difficulty-menu");
        this.childs = this.menus.childNodes;
        this.start();
    }

    show_all_childsNode() {
        console.log("")
        for (let i = 0; i < this.childs.length; i++) {
            console.log(this.childs[i]);
        }
    }

    match_node(node) {
        for (let i = 0; i < this.childs.length; i++) {
            if (this.childs[i].isEqualNode(node))
                return true;
        }
        return false;
    }

    start() {
        this.hide_second_menu();
        this.add_listening_events();
    }

    hide_first_menu() {
        if (this.match_node(this.menu_field))
            this.menus.removeChild(this.menu_field);
    }
    hide_second_menu() {
        if (this.match_node(this.difficulty_menu))
            this.menus.removeChild(this.difficulty_menu);
    }
    show_first_menu() {
        if (!this.match_node(this.menu_field))
            this.menus.appendChild(this.menu_field);
    }
    show_second_menu() {
        if (!this.match_node(this.difficulty_menu))
            this.menus.appendChild(this.difficulty_menu);
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function() {
            outer.hide_first_menu();
            outer.show_second_menu();
        });
        this.$multi_mode.click(function() {
            outer.hide();
            outer.root.playground.show(1, MULTI_MODE);
            console.log("click multi mode");
        });
        this.$settings.click(function() { //临时充当退出按钮
            outer.root.settings.logout_remote();
        });
        this.$easy.click(function() {
            outer.hide();
            outer.root.playground.show(1, SINGLE_MODE);
        });
        this.$normal.click(function() {
            outer.hide();
            outer.root.playground.show(2, SINGLE_MODE);
        });
        this.$hard.click(function() {
            outer.hide();
            outer.root.playground.show(3, SINGLE_MODE);
        });
        this.$back.click(function() {
            outer.hide_second_menu();
            outer.show_first_menu();
        });
    }

    show() { // 显示menu界面
        this.$menu.show();
    }

    hide() { // 关闭menu界面
        this.$menu.hide();
    }
}