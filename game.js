let game = {
  start: function () {
    this.ctx = document.getElementById("mycanvas").getContext("2d");
    let background = new Image();
    background.src = "images/background.png";
    window.requestAnimationFrame(() => {
      this.ctx.drawImage(background, 0, 0);
    });
  },
};

window.addEventListener("load", () => {
  game.start();
});
