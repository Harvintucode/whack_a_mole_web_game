import { GameLoop } from "./loop.js";
import { InputHandler } from "./input.js";

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.width = canvas.width;
        this.height = canvas.height;

        // trạng thái game
        this.state = "RUNNING";

        // player demo
        this.player = {
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            speed: 5
        };

        // input
        this.input = new InputHandler();

        // game loop
        this.loop = new GameLoop(
            this.update.bind(this),
            this.render.bind(this)
        );
    }

    start() {
        this.loop.start();
    }

    update(deltaTime) {

        // di chuyển player
        if (this.input.keys["ArrowRight"]) {
            this.player.x += this.player.speed;
        }

        if (this.input.keys["ArrowLeft"]) {
            this.player.x -= this.player.speed;
        }

        if (this.input.keys["ArrowUp"]) {
            this.player.y -= this.player.speed;
        }

        if (this.input.keys["ArrowDown"]) {
            this.player.y += this.player.speed;
        }

        // giới hạn màn hình
        if (this.player.x < 0) {
            this.player.x = 0;
        }

        if (this.player.y < 0) {
            this.player.y = 0;
        }

        if (this.player.x + this.player.width > this.width) {
            this.player.x = this.width - this.player.width;
        }

        if (this.player.y + this.player.height > this.height) {
            this.player.y = this.height - this.player.height;
        }
    }

    render() {

        // clear màn hình
        this.ctx.clearRect(0, 0, this.width, this.height);

        // vẽ player
        this.ctx.fillStyle = "lime";
        this.ctx.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
    }
}