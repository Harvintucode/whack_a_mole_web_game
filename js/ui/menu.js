// ==========================================================
// menu.js – Điều khiển màn hình Menu
// ==========================================================

import { show, hide, $ } from '../utils/helper.js';

export class MenuUI {
  constructor() {
    this.screenEl = $('start-screen');
  }

  /** Hiển thị màn hình menu */
  show() {
    document.body.className = 'menu-bg';

    show(this.screenEl);

    startMenuEffects();
  }

  /** Ẩn màn hình menu */
  hide() {

    hide(this.screenEl);

    stopMenuEffects();
  }
}
const menuEffects =
  document.getElementById("menu-effects");
let fallingInterval;
const fallingImages = [
  "../assets/falling_obj.png",
];

export function spawnFallingObject() {

  const obj = document.createElement("img");

  // random image
  const randomImage =
    fallingImages[
    Math.floor(Math.random() * fallingImages.length)
    ];

  obj.src = randomImage;

  obj.classList.add("falling-obj");

  // random vị trí ngang
  obj.style.left =
    Math.random() * 100 + "vw";

  // random kích thước
  obj.style.width = "100px";

  // random tốc độ rơi
  obj.style.animationDuration = "4s";

  menuEffects.appendChild(obj);

  // xóa object sau khi rơi xong
  setTimeout(() => {
    obj.remove();
  }, 8000);
}
export function startMenuEffects() {

  fallingInterval =
    setInterval(spawnFallingObject, 500);

}

export function stopMenuEffects() {

  clearInterval(fallingInterval);

}