document.addEventListener("DOMContentLoaded", function() {

  let tool = 'brush';
  let prevTool = 'brush';

  document.querySelector('#brush').addEventListener("click", () => {
    console.log('changed to brush:', tool);
    tool = 'brush';
  });

  let eraser = document.querySelector('#eraser').addEventListener("click", () => {
    console.log('changed to eraser:', tool);
    tool = 'eraser';
  });

  let clearAll = document.querySelector('#clear-all');
  clearAll.addEventListener("click", function() {
    prevTool = tool;
    tool = 'clear';
    console.log('Clearing canvas');
  });

  let mouse = {
    click: false,
    move: false,
    pos: {
      x: 0,
      y: 0
    },
    pos_prev: false
  };

  // get canvas element and create context
  let canvas = document.getElementById('drawing');
  let ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  let socket = io.connect();

  // set canvas to full browser width/height
  canvas.width = width;
  canvas.height = height;

  // register mouse event handlers
  canvas.onmousedown = function(e) {
    mouse.click = true;
  };
  canvas.onmouseup = function(e) {
    mouse.click = false;
  };

  canvas.onmousemove = function(e) {
    // normalize mouse position to range 0.0 - 1.0
    mouse.pos.x = e.clientX / width;
    mouse.pos.y = e.clientY / height;
    mouse.move = true;
  };

  // set initial line properties
  let hue = 0;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 100;
  // ctx.globalCompositeOperation = 'xor';
  // 'destination-out'; Erase?
  // 'multiply';
  // draw line received from server
  socket.on('draw_line', function(data) {
    let line = data.line;
    if (tool === 'brush') {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.beginPath();
      ctx.moveTo(line[0].x * width, line[0].y * height);
      ctx.lineTo(line[1].x * width, line[1].y * height);
      ctx.stroke();

      hue++;
      if (hue >= 360) {
        hue = 0;
      }
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.moveTo(line[0].x * width, line[0].y * height);
      ctx.lineTo(line[1].x * width, line[1].y * height);
      ctx.stroke();
    }

  });

  // main loop, running every 25ms
  function mainLoop() {
    // check for clear button click
    if (tool === 'clear') {
      ctx.clearRect(0, 0, width, height);
      tool = prevTool;
    }
    // check if the user is drawing
    if (mouse.click && mouse.move && mouse.pos_prev) {
      // send line to to the server
      socket.emit('draw_line', {
        line: [mouse.pos, mouse.pos_prev]
      });
      mouse.move = false;
    }
    mouse.pos_prev = {
      x: mouse.pos.x,
      y: mouse.pos.y
    };
    setTimeout(mainLoop, 15);
  }
  mainLoop();
});
