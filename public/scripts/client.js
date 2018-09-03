$(document).ready(() => {

  const canvas = new fabric.Canvas('whiteboard');
  const templateId = $('#template-id').text();
  const templates = ['','/img/calendar.svg','/img/mockup.svg','/img/graph.svg'];
  canvas.setHeight(1000);
  canvas.setWidth(1800);
  if (templateId !== 0) {
    canvas.setBackgroundImage(templates[templateId], canvas.renderAll.bind(canvas));
  }

  // Set default canvas values
  const ERASE = 0;
  const LINE = 1;
  const RECT = 2;
  const CIRCLE = 3;
  const HAND = 4;
  const SELECT = 5;
  const TEXTBOX = 6;
  const DRAW = 7
  const TRIANGLE = 8;
  let mode = SELECT;
  enableSelectMode();
  canvas.freeDrawingBrush.color = '#000000';
  let currentWidth = canvas.freeDrawingBrush.width = 15;
  let currentColor = '#000000';
  let currentBorderColor = '#000000';
  let borderSize = 4;
  canvas.freeDrawingBrush.width = borderSize + 1;
  canvas.zoomToPoint({
    x: 0,
    y: 0
  }, 0.78);

  const socket = io.connect();
  let DEBUG = false;

  ////////////////////////////////////////////
  //               USER INFO                //
  ////////////////////////////////////////////

  const roomURL = window.location.pathname.split('/')[2];
  let client;
  let webrtc;
  let videoOn = true;

  // On page load, user is prompted to select a username
  $(`<div id="username-form">
      <div class="username-box">
      <h3>Welcome!</h3>
        <form id="select-username">
          <input type="text" placeholder="Enter a username" autofocus onfocus="this.select()" /><button>GO</button>
        </form>
      </div>
    </div>`).prependTo(document.body);

  // Once username is selected, the username is sent to the server and the username form/div is removed
  $("#select-username").on('submit', (e) => {
    e.preventDefault();
    $username = $('#select-username input').val();
    if ($username.trim().length < 1) { return; }

    // Send username to server
    socket.emit('username selected', $username);
    $('#username-form').remove();
  });

  function toggleVideo() {
    if (videoOn === true) {
      webrtc.pause();
      videoOn = false;
    } else {
      webrtc.resume();
      videoOn = true;
    }
  }

  socket.on('connected', (msg) => {
    listUsers(msg.currentUsers);
    getCursors(msg.currentUsers);
  });

  socket.on('connection established', (user) => {
    client = user;
    addUser(user);

    // Get video
    webrtc = new SimpleWebRTC({
      localVideoEl: 'localVideo',
      remoteVideosEl: 'remoteVideos',
      autoRequestMedia: true,
      localVideo: {
        autoplay: true,
        muted: true
      },
      media: {audio: true, video: true},
      autoRemoveVideos: true
    })

    // Join video room
    webrtc.on('readyToCall', function () {
      webrtc.joinRoom(roomURL);
    });
  });

  $('#localVideo').on('click', (e) => {
    toggleVideo();
  });

  socket.on('new connection', (user) => {
    addUser(user);
    addCursor(user);
  });

  socket.on('user disconnected', (user) => {
    removeUser(user);
  });

  socket.on('board deleted', () => {
    window.location = "/";
  });


  ////////////////////////////////////////////
  //             TOOL HELPERS               //
  ////////////////////////////////////////////

  // Make Objects Selectable
  function makeObjectsSelectable(boolean) {
    canvas.forEachObject(function(object) {
      object.set({
        selectable: boolean
      }).setCoords();
    })
  }

  function orderCanvas() {
    canvas.getObjects().forEach(each => {
      if(each.type === "i-text")
        canvas.bringToFront(each)
    })
  }
  // CLEAR ALL MODES
  function clearModes() {
    $(".selected").removeClass("selected");
    canvas.isDrawingMode = false;
    canvas.selection = true;
    makeObjectsSelectable(true);
    orderCanvas();
  }

  // SET TOOL MODE
  function setupForMode(newMode) {
  $(".selected").removeClass("selected");
    canvas.isDrawingMode = false;
    canvas.selection = true;
    makeObjectsSelectable(true);
    orderCanvas();
    mode = newMode
  }

  // Select Tool
  function enableSelectMode() {
    setupForMode(SELECT);
    $('#select').addClass('selected');
  }

  ////////////////////////////////////////////
  //             TOOL BUTTONS               //
  ////////////////////////////////////////////

  $('#select').on('click', function(e) { enableSelectMode() });

  // Hand Tool (Move canvas)
  $('#hand').on('click', function(e) {
    setupForMode(HAND);
    canvas.discardActiveObject();
    $('#hand').addClass('selected');
    makeObjectsSelectable(false);
  });

  // Draw Tool
  $('#draw').on('click', function(e) {
    setupForMode(DRAW);
    canvas.isDrawingMode = true;
    $('#draw').addClass('selected');
   });

  // Line Tool
  $('#line').on('click', function(e) {
    setupForMode(LINE);
    makeObjectsSelectable(false);
    $('#line').addClass('selected');
   });

  // Circle Tool
  $('#circle').on('click', function(e) {
    setupForMode(CIRCLE);
    canvas.discardActiveObject();
    $('#circle').addClass('selected');
    makeObjectsSelectable(false);
   });

  // Triangle Tool
  $('#triangle').on('click', function(e) {
    setupForMode(TRIANGLE);
    canvas.discardActiveObject();
    $('#triangle').addClass('selected');
    makeObjectsSelectable(false);
   });

  // Draw Rectangle Tool
  $('#draw-rect').on('click', function(e) {
    setupForMode(RECT);
    canvas.discardActiveObject();
    $('#draw-rect').addClass('selected');
    makeObjectsSelectable(false);
   });

  // Text box
  $('#textbox').on('click', function(e) {
    setupForMode(TEXTBOX);
    makeObjectsSelectable(false);
    $('#textbox').addClass('selected');
   });

  // Delete Tool
  $('#url-to-clipboard').on('click', function(e) {
    copyUrlToClipboard();
   });

  // Erase Tool
  $('#delete').on('click', function(e) {
    setupForMode(ERASE);
    canvas.discardActiveObject();
    $('#delete').addClass('selected');
   });




  // Delete Board Tool
  $('#delete-board').on('click', function(e) {
    $container = $('<div id="confirm-delete">');
    $box = $('<div id="confirm-delete-box">').append(`<p>
        <strong>Are you sure you want to delete this board?</strong>
        There's no going back!
      </p>`);
    $cancel = $('<button id="delete-cancel">').text("CANCEL").on('click', (e) => {
      $('#confirm-delete').remove();
    });
    $confirmForm = $(`<form action="/boards/${roomURL}?_method=DELETE" method="POST" style="display:inline;">
        <button>CONFIRM</button></form>`)
      .on('submit', (e) => {
        socket.emit('delete board', roomURL);
      });

    $box.append($cancel);
    $box.append($confirmForm);
    $container.append($box);
    $('body').prepend($container);
  });

  // // Delete Board Tool
  // $('#delete-cancel').on('click', function(e) {
  //   console.log("CANCEL");
  //   $('#confirm-delete').remove();
  //  });




  $('#brush-size').on('input', function(e) {
    // let pixelSize = parseInt($('#brush-size').val(), 10) * 2
    // borderSize = pixelSize;
    // canvas.freeDrawingBrush.width = pixelSize + 1;
    updateCanvasBrush()
  });

  function updateCanvasBrush() {
    let brushSize = parseInt($('#brush-size').val(), 10) * 2
    borderSize = brushSize;
    canvas.freeDrawingBrush.width = brushSize + 1;
  }
  // Add Image Tool
  $('#add-image').on('change', function(e) {
    let reader = new FileReader();
    reader.onload = function(event) {
      let imgObj = new Image();
      imgObj.src = event.target.result;
      imgObj.onload = function() {
        let image = new fabric.Image(imgObj);
        image.set({
          left: 50,
          top: 50,
        }).scale(0.5);
        addComponent(image);
      };
    };
    reader.readAsDataURL(e.target.files[0]);
    $("#add-image").val("");
    enableSelectMode();
  });

  // Color Picker
  $("#colorPicker").spectrum({
    color: currentColor,
    showPalette: true,
    palette: [
      ['#000000', '#ffffff'],
      ['#bc000d', '#df3b1a'],
      ['#fec945', '#008a29'],
      ['#006b75', '#0076d7'],
      ['#0051c7', '#561ce1'],
      ['#795548', '#939393'],

    ],
    change: function(color) {
      currentColor = color.toHexString()
      canvas.freeDrawingBrush.color = currentColor;
      canvas.freeDrawingBrush.shadow = currentColor;
    }
  });

    // Border Color Picker
    $("#border-color-picker").spectrum({
      color: currentBorderColor,
      showPalette: true,
      palette: [
        ['#000000', '#ffffff'],
        ['#FF4136', '#0074D9'],
        ['#2ECC40', '#f9f878'],
        ['#be50b7', '#FF851B'],
        ['#39CCCC', '#AAAAAA'],
      ],
      change: function(color) {
        currentBorderColor = color.toHexString()
      }
    });


  // Save canvas to image
  $('#save-image').on('click', function(e) {
    canvas.discardActiveObject();
    $('#whiteboard').get(0).toBlob(function(blob) {
      saveAs(blob, 'whiteboard.png');
    });
  });


  // Drag and drop to add image
  $('.board').on('drop', function(e) {
    if (DEBUG) console.log(e);

    let xpos = e.offsetX;
    let ypos = e.offsetY;
    e = e || window.event;
    if (e.preventDefault) {
      e.preventDefault();
    }
    let dt = e.dataTransfer || (e.originalEvent && e.originalEvent.dataTransfer);
    let files = e.target.files || (dt && dt.files);
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let reader = new FileReader();

      //attach event handlers here...
      reader.onload = function(e) {
        if (DEBUG) console.log('second event:', e);
        let img = new Image();
        img.src = e.target.result;

        let image = new fabric.Image(img);
        image.set({
          left: xpos,
          top: ypos,
        }).scale(0.5);
        canvas.add(image);
      }
      reader.readAsDataURL(file);
    }

    return false;
  });
  $('.main').on('dragover', cancel);
  $('.main').on('dragenter', cancel);

  function cancel(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    return false;
  }

  $('#add-background').on('change', function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function(f) {
      var data = f.target.result;
      fabric.Image.fromURL(data, function(img) {
        // add background image
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height
        });
      });
    };
    reader.readAsDataURL(file);
    $("#add-background").val("");
    enableSelectMode();
  });


  $("#background-color-picker").spectrum({
    color: canvas.backgroundColor,
    showPalette: true,
    palette: [
      ['#000000', '#ffffff'],
      ['#bc000d', '#df3b1a'],
      ['#fec945', '#008a29'],
      ['#006b75', '#0076d7'],
      ['#0051c7', '#561ce1'],
      ['#795548', '#939393'],

    ],
    change: function(color) {
      canvas.backgroundColor = color.toHexString();
      canvas.renderAll();
      socket.emit("set_background_color", {color: canvas.backgroundColor})
    }
  });


  // Show Images Menu On Hover

  $('#image-menu').hover(
    function() {
      $('.image-nav').show().css('display', 'flex');
    }, function() {
      $('.image-nav').hide();
    }
  );

  $('.image-nav').hover(
    function() {
      $(this).show().css('display', 'flex');
    }, function() {
      $(this).hide();
    }
  );


  ////////////////////////////////////////////
  //             CANVAS EVENTS              //
  ////////////////////////////////////////////
  var inRedo = false;
  let componentHistory = [], historyIndex = 0;
  function trackComponentChanges(target, eventType) {
    if(inRedo) return;
    componentHistory.push({type: eventType, target: target});
  }
  function Undo() {
    if(componentHistory.length > 0)
      redoHistory(componentHistory.pop())
  }

  function Redo() {
    // TBD
  }

  function redoHistory(lastAction) {
    inRedo = true;
    if (DEBUG) console.log("redo history", lastAction)
    if(lastAction.type === "add") {
      removeComponents([lastAction.target]);
    } else {
      addComponent(lastAction.target, false);
    }
    inRedo = false;
  }


  canvas.on('object:modified', function(event) {
    if(DEBUG) console.log("OBJECT MODIFIED")
    // debouncing/throtling not required.
    componentChanged(event, true)
  });

  canvas.on('text:changed', function(event) {
    // debouncing/throtling not required.
    modifyingComponent(event.target)
  });

  canvas.on('mouse:up', function(event) {
    if (mode === ERASE) {
      removeComponents(canvas.getActiveObjects());
    }
  });

  ['object:rotating', 'object:moving', 'object:scaling']
    .forEach(function(eventType) {
      canvas.on(eventType, function(event) {
        throttled(75, componentChanged(event, false))
      });
    })

  canvas.on('path:created', function(event) {
    let path = event.path;
    path.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          id: this.id
        });
      };
    })(path.toObject);

    path.id = uuidv4();
    trackComponentChanges(path, "add");
    socket.emit("path_created", path.toJSON())
  });

  let rect, triangle, line, circle, isMouseDown, origX, origY;
  // TOOLS EVENT HANDLING
  ['mouse:down', 'mouse:move', 'mouse:up', 'dragenter', 'dragleave', 'drop', 'dragover']
    .forEach(function(eventType) {
      canvas.on(eventType, function(event) {
        handleDrawRect(event);
        handleDrawTriangle(event);
        handleDrawCircle(event);
        handleDrawLine(event);
        handleDropTextBox(event);
        handlePanning(event, this);
    });
  })

  ////////////////////////////////////////////
  //                LAYERING                //
  ////////////////////////////////////////////

  let currentUserId = uuidv4();
  let currentUserName = "Bob";
  canvas.on('mouse:move', throttled(100, function(event) {
    let pointer = canvas.getPointer(event.e);
    socket.emit("user_position", {client: client, pos: pointer})
  }));
  // reposition cursor received from server
  socket.on('user_position', function(data) {
    let absX = parseInt(data.pos.x), absY = parseInt(data.pos.y);
    let boundaries = canvas.calcViewportBoundaries();
    topPos = (((data.pos.y - boundaries.tl.y )) * canvas.getZoom())  + canvas._offset.top;
    leftPos = (((data.pos.x - boundaries.tl.x )) * canvas.getZoom()) + canvas._offset.left;
    $(`#${data.client.id}`).css({top: topPos, left: leftPos});
  });

  // throttle async functions
  function throttled(delay, fn) {
    let lastCall = 0;
    return function (...args) {
      const now = (new Date).getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      return fn(...args);
    }
  }

  // debuounce async functions
  function debounced(delay, fn) {
    let timerId;
    return function (...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        fn(...args);
        timerId = null;
      }, delay);
    }
  }


  canvas.on('mouse:over', function(event) {
    if(event.target) {
      event.target.set('opacity', 0.7);
      canvas.renderAll();
    }
  });
  canvas.on('mouse:out', function(event) {
    if(event.target) {
      event.target.set('opacity', 1);
      canvas.renderAll();
    }
  });



  /// MOUSE DOWN EVENT
  canvas.on('mouse:down', function(event) {
    if(event.e.metaKey && mode === SELECT) {
      let action = event.e.shiftKey ? "lower" : "elevate"
      layerComponent(canvas.getActiveObject(), action, true);  // CMD/CTRL UPARROW
    }
    isMouseDown = true;
  });

  function copyUrlToClipboard() {
    let content = $(location).attr('href');
    let dummy = $('<input>').val(content).appendTo('body').select()
    document.execCommand('copy')
  }

  // // Elevate Components to the top
  // function elevateComponent(component) {
  //   if(component === "activeSelection") {
  //     component.getObjects().forEach(each => {
  //       canvas.bringToFront(each);
  //       socket.emit("elevate_component", { id: each.id })
  //     });
  //   }
  //   else {
  //     canvas.bringToFront(component);
  //     socket.emit("elevate_component", { id: component.id } )
  //   }
  //   orderCanvas();
  // }

  // Elevate Components to the top
  function layerComponent(component, action, notify) {
    function performLayering(component, action) {
      if(action === "elevate") canvas.bringToFront(component);
      if(action === "lower") canvas.sendToBack(component);
      if(notify) socket.emit("layer_component", { id: component.id, action: action } )
    }
    if(component === "activeSelection") {
      component.getObjects().forEach(each => {
        performLayering(each, action)
      });
    }
    else {
      performLayering(component, action)
    }
    orderCanvas();
  }

  /// KEYBOARD EVENTS
  document.addEventListener('keydown', function(event){
    var char = event.keyCode;
    var ctrlMetaDown = event.ctrlKey || event.metaKey;
    if(char == 27) enableSelectMode();         // ESC KEY
    if(ctrlMetaDown && char === 67) Copy();   // CMD/CTR C
    if(ctrlMetaDown && char === 86) Paste();  // CMD/CTRL V
    if(ctrlMetaDown && char === 90)  // CMD/CTRL Z
      if(event.shiftKey) {
        Redo() } else { Undo()} ;

    // DELETE KEY
    if(!ctrlMetaDown && char === 8 && !isEditingText()) {
      let currentSelection = canvas.getActiveObjects();
      if (currentSelection.length > 0) {
        removeComponents(canvas.getActiveObjects());
      }
    }

    // ELEVATE/LOWER COMPONENT
    if(ctrlMetaDown && char === 38) {
      // let action = event.shiftKey ? "lower" : "elevate"
      // layerComponent(canvas.getActiveObject(), action);  // CMD/CTRL UPARROW
    }

    function isEditingText() {
      // return true if current selection is text and in "text mode"
      var objects = canvas.getActiveObjects();
      return objects.length === 1 && objects[0].type === "i-text" && objects[0].isEditing === true
    }
  });

  // MOUSE UP EVENT
  canvas.on('mouse:up', function(event) {
    isMouseDown = false;
    if (mode === ERASE) {
      removeComponents(canvas.getActiveObjects());
    }
  });

  /////////////
  /// Tools ///
  /////////////

  // DRAW RECTANGLE
  function handleDrawRect(event) {
    if(mode !== RECT) return;

    if(event.e.type === "mousedown" || event.e.type === "touchstart") {
      canvas.selection = false;
      let pointer = canvas.getPointer(event.e);
      origX = pointer.x;
      origY = pointer.y;
      pointer = canvas.getPointer(event.e);
      rect = new fabric.Rect({
        selectable: false,
        hasControls: true,
        left: origX,
        top: origY,
        originX: 'left',
        originY: 'top',
        width: pointer.x - origX,
        height: pointer.y - origY,
        angle: 0,
        fill: currentColor,
        stroke: currentBorderColor,
        strokeWidth: borderSize,
        transparentCorners: false
      });
      canvas.add(rect)
    }
    if(event.e.type === "mousemove" || event.e.type === "touchmove") {
      if (!isMouseDown) return;

      let pointer = canvas.getPointer(event.e);
      if (origX > pointer.x) {
        rect.set({ left: Math.abs(pointer.x) });
      }
      if (origY > pointer.y) {
        rect.set({ top: Math.abs(pointer.y) });
      }
      rect.set({ width: Math.abs(origX - pointer.x) });
      rect.set({ height: Math.abs(origY - pointer.y) });
      canvas.renderAll();
    }
    if(event.e.type === "mouseup" || event.e.type === "touchend") {
      addComponent(rect, true);
    }
  }

    // DRAW TRIANGLE
    function handleDrawTriangle(event) {
      if(mode !== TRIANGLE) return;

      if(event.e.type === "mousedown" || event.e.type === "touchstart") {
        canvas.selection = false;
        let pointer = canvas.getPointer(event.e);
        origX = pointer.x;
        origY = pointer.y;
        pointer = canvas.getPointer(event.e);
        triangle = new fabric.Triangle({
          selectable: false,
          hasControls: true,
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: pointer.x - origX,
          height: pointer.y - origY,
          angle: 0,
          fill: currentColor,
          stroke: currentBorderColor,
          strokeWidth: borderSize,
          transparentCorners: false
        });
        canvas.add(triangle)
      }
      if(event.e.type === "mousemove" || event.e.type === "touchmove") {
        if (!isMouseDown) return;

        let pointer = canvas.getPointer(event.e);
        if (origX > pointer.x) {
          triangle.set({ left: Math.abs(pointer.x) });
        }
        if (origY > pointer.y) {
          triangle.set({ top: Math.abs(pointer.y) });
        }
        triangle.set({ width: Math.abs(origX - pointer.x) });
        triangle.set({ height: Math.abs(origY - pointer.y) });
        canvas.renderAll();
      }
      if(event.e.type === "mouseup" || event.e.type === "touchend") {
        addComponent(triangle, true);
      }
    }

   // DRAW CIRCLE
   function handleDrawCircle(event) {
    if(mode !== CIRCLE) return;

    if(event.e.type === "mousedown" || event.e.type === "touchstart") {
      canvas.selection = false;
      isDown = true;
      let pointer = canvas.getPointer(event.e);
      origX = pointer.x;
      origY = pointer.y;
      circle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 1,
        strokeWidth: borderSize,
        stroke: 'black',
        fill: currentColor,
        stroke: currentBorderColor,
        transparentCorners: false,
        selectable: false,
        originX: 'center',
        originY: 'center'
      });
      canvas.add(circle);
    }
    if(event.e.type === "mousemove" || event.e.type === "touchmove") {
      if (!isMouseDown) return;
      let pointer = canvas.getPointer(event.e);
      circle.set({
        radius: Math.abs(origX - pointer.x)
      });
      canvas.renderAll();
    }
    if(event.e.type === "mouseup" || event.e.type === "touchend") {
      addComponent(circle, true);
    }
  }

  // DRAW LINE
  function handleDrawLine(event) {
    if(mode !== LINE) return;

    if(event.e.type === "mousedown" || event.e.type === "touchstart") {
      canvas.selection = false;
      var pointer = canvas.getPointer(event.e);
      var points = [pointer.x, pointer.y, pointer.x, pointer.y];
      line = new fabric.Line(points, {
        strokeWidth: borderSize,
        stroke: currentColor,
        originX: 'center',
        originY: 'center',
        selectable: false
      });
      canvas.add(line);
    };
    if(event.e.type === "mousemove" || event.e.type === "touchmove") {
      if (!isMouseDown) return;
      var pointer = canvas.getPointer(event.e);
      line.set({
        x2: pointer.x,
        y2: pointer.y
      });
      canvas.renderAll();
    }
    if(event.e.type === "mouseup" || event.e.type === "touchend") {
      addComponent(line, true);
    }
  }

  // TEXTBOX
  function handleDropTextBox(event) {
    if(mode !== TEXTBOX) return;

    if(event.e.type === "mousedown" || event.e.type === "touchstart") {
      var pointer = canvas.getPointer(event.e);
      var textbox = new fabric.IText('MyText', {
        width: 300,
        height: 300,
        top: pointer.y,
        left: pointer.x,
        hasControls: true,
        fontSize: 30,
        fixedWidth: 300,
        fixedFontSize: 30,
        fill: currentColor,
        fontFamily: 'Open Sans'
      });
      canvas.add(textbox).setActiveObject(textbox);
      addComponent(textbox, true);
      enableSelectMode();
    }
  }

  // HANDLE PANNING
  function handlePanning(event, context) {
    if(mode !== HAND) return;

    if(event.e.type === "mousedown" || event.e.type === "touchstart") {
      canvas.selection = false;
      let evt = event.e;
      context.isDragging = true;
      context.selection = false;
      context.lastPosX = evt.clientX;
      context.lastPosY = evt.clientY;
    }
    if(event.e.type === "mousemove" || event.e.type === "touchmove") {
      if (context.isDragging) {
        var e = event.e;
        context.viewportTransform[4] += e.clientX - context.lastPosX;
        context.viewportTransform[5] += e.clientY - context.lastPosY;
        context.requestRenderAll();
        context.lastPosX = e.clientX;
        context.lastPosY = e.clientY;

        // panning code added by Aaron:
        // let delta = new fabric.Point(event.e.movementX, event.e.movementY);
        // canvas.relativePan(delta);

        // let canvasViewPort = canvas.viewportTransform;

        // let imageHeight = canvas.height * canvasViewPort[0];
        // let imageWidth = canvas.width * canvasViewPort[0];

        // let bottomEndPoint = canvas.height * (canvasViewPort[0] - 1);
        // if (canvasViewPort[5] >= 0 || -bottomEndPoint > canvasViewPort[5]) {
        //   canvasViewPort[5] = (canvasViewPort[5] >= 0) ? 0 : -bottomEndPoint;
        // }

        // let rightEndPoint = canvas.width * (canvasViewPort[0] - 1);
        // if (canvasViewPort[4] >= 0 || -rightEndPoint > canvasViewPort[4]) {
        //   canvasViewPort[4] = (canvasViewPort[4] >= 0) ? 0 : -rightEndPoint;
        // }
        /// End of code added by Aaron

      }
    }
    if(event.e.type === "mouseup") {
      context.isDragging = false;
      context.selection = true;
    }
  }

  // Zoom in/out with mousewheel
  canvas.on('mouse:wheel', function(event) {
    var delta = event.e.deltaY;
    var pointer = canvas.getPointer(event.e);
    var zoom = canvas.getZoom();
    zoom = zoom - delta / 400;
    if (zoom > 3) zoom = 3;
    if (zoom < 0.2) zoom = 0.2;
    canvas.zoomToPoint({
      x: event.e.offsetX,
      y: event.e.offsetY
    }, zoom);
    event.e.preventDefault();
    event.e.stopPropagation();
  });

  // component changed
  function componentChanged(event, isFinal) {
    // tbd debounce instead of trottling
    if (event.target.type === "activeSelection") {
      groupUpdate(event.target, "modify", isFinal)
      } else {
      modifyingComponent(event.target, isFinal)
    }
  }

  function groupUpdate(group, method, isFinal) {
    var ids = group.getObjects().map(e => e.id);
    group.clone(function(clonedObj) {
      clonedObj._restoreObjectsState();
      clonedObj.getObjects().forEach(function(each, i) {
        let cloned = each;
        cloned.id = ids[i];   // restore custom IDs
        if(method === "modify") modifyingComponent(cloned, isFinal);
        if(method === "create") addComponent(cloned, true);
      })
    })
  }

  //////////////////////////////////////////
  //              SOCKET IO               //
  //////////////////////////////////////////
  function addComponent(component, ignoreCanvas) {
    component.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          id: this.id
        });
      };
    })(component.toObject);
    if(!component.id) component.id = uuidv4();
    component.setCoords();
    if(DEBUG) console.log("Create Component", component)
    if (!ignoreCanvas) canvas.add(component);
    trackComponentChanges(component, "add");
    socket.emit('create_component', component.toJSON());
  };

  // Remove component
  function removeComponents(components) {
    components.forEach(obj => {
      canvas.remove(obj);
      trackComponentChanges(obj, "remove");
      canvas.discardActiveObject();
      socket.emit("remove_component", { id: obj.id })
    });
  }

  function componentParams(component) {
    return {  id: component.id,
              type: component.type,
              left: component.left,
              top: component.top,
              height: component.height,
              scaleX: component.scaleX,
              scaleY: component.scaleY,
              angle: component.angle,
              text: component.text
    }
  }

  // notify component that is being modified
  // ie: mouse continuous movement
  function modifyingComponent(component, isFinal) {
    if (DEBUG) console.log("modifying component", isFinal, componentParams(component))
    let msg_type = isFinal ? "modified_component" : "modify_component";
    socket.emit(msg_type, componentParams(component))
  };

  // path created received from server
  socket.on('path_created', function(path) {
    if (DEBUG) console.log('incoming', path);
    fabric.util.enlivenObjects([path], function(objects) {
      objects.forEach(function(each) {
        canvas.add(each);
      });
    });
  });

  // draw component received from server
  socket.on('create_component', function(data) {
    if (DEBUG) console.log("incomding add", data)
    fabric.util.enlivenObjects([data], function(objects) {
      objects.forEach(function(p) {
        canvas.add(p);
      })
    })
  });

  // delete component request from server
  socket.on('remove_component', function(data) {
    if (DEBUG) console.log("receiving data", data)
    let component = findComonent(data.id)
    if (component) {
      canvas.remove(component);
    }
  });

  // background color request from server
  socket.on('set_background_color', function(data) {
    if (DEBUG) console.log("receiving background color data", data)
    canvas.backgroundColor = data.color;
    canvas.renderAll();
  });

  function findComonent(id) {
    return canvas.getObjects().find((each) => each.id === id)
  }

  // modify component received from server
  socket.on('modify_component', function(data) {
    if (DEBUG) console.log("receiving modifying data", data)
    let targetComponent = findComonent(data.id)
    if (targetComponent) {
      targetComponent.left = data.left;
      targetComponent.top = data.top;
      targetComponent.scaleX = data.scaleX;
      targetComponent.scaleY = data.scaleY;
      targetComponent.angle = data.angle;
      targetComponent.set("text",data.text);
      canvas.renderAll();
      if(mode === SELECT)
        targetComponent.set({ selectable: true }).setCoords();
    } else {
      if (DEBUG) console.log("Unknown Component Modified.", data)
    }
  });

  // layer component request from server
  socket.on('layer_component', function(data) {
    let component = findComonent(data.id);
    if (component) layerComponent(component, data.action);
  });


  //////////////////////////////////////////
  //              COPY PASTE              //
  //////////////////////////////////////////

  $('#duplicate').on('click', function(e) {
    if (canvas.getActiveObject())
      Copy();
    Paste();
  });

  let _clipboard;
  function Copy() {
    canvas.getActiveObject().clone(function(cloned) {
      _clipboard = cloned;
    });
  }

  function Paste() {
    // clone again, so you can do multiple copies.
    if (!_clipboard) return

    _clipboard.clone(function(clonedObj) {
      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === 'activeSelection') {
        // active selection needs a reference to the canvas.
        clonedObj.canvas = canvas;
        clonedObj.forEachObject(function(obj) {
          obj.id = uuidv4();
          canvas.add(obj);
        });
        // this should solve the unselectability
        clonedObj.setCoords();
      } else {
        addComponent(clonedObj);
      }
      _clipboard.top += 10;
      _clipboard.left += 10;
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
      if (clonedObj.type === 'activeSelection') {
        groupUpdate(clonedObj, "create")
      }
    });
  }

});
