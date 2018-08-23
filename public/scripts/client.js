document.addEventListener("DOMContentLoaded", function() {

    let canvas = new fabric.Canvas('board');
    canvas.setHeight(window.innerHeight);
    canvas.setWidth(window.innerWidth);

  // let socket = io.connect();

  let rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 100,
    height: 50,
    fill: 'red'
  });

  canvas.add(rect);
});
