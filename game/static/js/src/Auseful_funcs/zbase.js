let COLORS = ["pink", "blue", "purple", "orange", "grey"]
class Funcions {
    constructor() {}

    static sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    static make_color() {
        return COLORS[Math.floor(Math.random() * 5)];
    }
}