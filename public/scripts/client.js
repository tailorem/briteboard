document.addEventListener("DOMContentLoaded", function() {

  let canvas = new fabric.Canvas('board');
  canvas.setBackgroundColor('white', canvas.renderAll.bind(canvas));
  canvas.setHeight(600);
  canvas.setWidth(800);
  // canvas.setDimensions({width: '1000px', height: '1000px'}, {cssOnly: true})
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
