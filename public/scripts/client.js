$(document).ready(function () {

  let canvas = new fabric.Canvas('whiteboard');
  canvas.setHeight(800);
  canvas.setWidth(1200);
  canvas.setBackgroundImage('/img/background.jpg', canvas.renderAll.bind(canvas));
  // Set default canvas values
  let eraserMode = false;
  let rectangleMode = false;
  let handMode = false;
  enableSelectMode();
  canvas.freeDrawingBrush.color = '#000000';
  let currentWidth = canvas.freeDrawingBrush.width = 15;
  let currentColor = '#000000';


  const socket = io.connect();
  let DEBUG = false;

  ////////////////////////////////////////////
  //             CLIENT INFO                //
  ////////////////////////////////////////////

  function listUsers(users) {
    console.log(users);
    $users = $('#users');
    $users.empty(); // improve this by removing user by id?
    users.forEach(function(user) {
      userId = Object.keys(user)[0];
      user = user[Object.keys(user)[0]];
      $("<h3>").text(user.name).appendTo($users);
    });
  }

  // On connection, user is prompted to select a username
  (function() {
    $(`<div id="username-form" style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; z-index:100; position:fixed;">
        <div style="opacity:1; padding: 1em; background-color:lightgrey; border-radius:1em;">
          <form id="select-username">
            <p>Select a username:</p>
            <input type="text" style="outline: none;" />
            <button>GO</button>
          </form>
        </div>
      </div>`).prependTo(document.body);

    // Once username is selected, the username is sent to the server and the username form/div is removed
    $("#select-username").on('submit', function(e){
      e.preventDefault();
      $username = $('#select-username input').val();

      // Send username to server
      socket.emit('username selected', $username);
      $('#username-form').remove();

      console.log('Username submitted:', $username)
    });
  })();

  socket.on('connected', function(msg) {
    console.log(msg);
  });

  socket.on('new connection', function(msg) {
    console.log(msg);
  });

  socket.on('user disconnected', function(msg) {
    console.log(msg);
  });


  // boardId = (window.location.pathname).split('/').reverse()[0];
  // console.log(boardId);

  // socket.on('new connection', function(currentUsers) {
  //   console.log('users after connection', currentUsers);
  //   listUsers(currentUsers);
  // });

  // socket.on('update username', function(currentUsers) {
  //   // listUsers(currentUsers);
  // });

  // socket.on('user disconnected', function(currentUsers) {
  //   console.log('users after disconnect', currentUsers);
  //   listUsers(currentUsers);
  // });



  ////////////////////////////////////////////
  //             TOOL BUTTONS               //
  ////////////////////////////////////////////

  // Select Tool
  $('#select').on('click', function(e) {
    enableSelectMode();
  });

  // Hand Tool (Move canvas)
  $('#hand').on('click', function(e) {
    enableHandMode();
  });


  // Draw Tool
  $('#draw').on('click', function(e) {
    enableDrawingMode();
  });

  // Circle Tool
  $('#circle').on('click', function(e) {
    addComponent(new fabric.Circle({
      left: 100,
      top: 100,
      radius: 75,
      fill: currentColor
    }));
    enableSelectMode();
  });

  // Draw Rectangle Tool
  $('#draw-rect').on('click', function(e) {
    enableRectMode();
  });

  // Text box
  $('#textbox').on('click', function(e) {
    addComponent(new fabric.IText('MyText', {
      width: 300,
      height: 300,
      top: 5,
      left: 5,
      hasControls: false,
      fontSize: 30,
      fixedWidth: 300,
      fixedFontSize: 30,
      fill: currentColor
    }))
    enableSelectMode();
  });

  // Delete Tool
  $('#delete').on('click', function(e) {
    enableEraserMode();
  });

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
      ['#FF4136', '#0074D9'],
      ['#2ECC40', '#f9f878'],
      ['#be50b7', '#FF851B'],
      ['#39CCCC', '#AAAAAA']
    ],
    change: function(color) {
      currentColor = color.toHexString()
      canvas.freeDrawingBrush.color = currentColor;
    }
  });

  // Change brush sizes
  $('#small-brush').on('click', function(e) {
    canvas.freeDrawingBrush.width = 3
    canvas.isDrawingMode = true;
    enableDrawingMode();
  });
  $('#medium-brush').on('click', function(e) {
    canvas.freeDrawingBrush.width = 15
    canvas.isDrawingMode = true;
    enableDrawingMode();
  });
  $('#large-brush').on('click', function(e) {
    canvas.freeDrawingBrush.width = 30
    enableDrawingMode();
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

  ////////////////////////////////////////////
  //             TOOL MODES                 //
  ////////////////////////////////////////////

  // CLEAR ALL MODES
  function clearModes() {
    $(".selected").removeClass("selected");
    canvas.isDrawingMode = false;
    canvas.selection = true;
    eraserMode = false;
    rectangeMode = false;
    handMode = false;
    canvas.forEachObject(function(o) {
      o.set({
        selectable: true
      }).setCoords();
    })
  }

  // DRAWING MODE
  function enableDrawingMode() {
    clearModes();
    canvas.isDrawingMode = true;
    $('#draw').addClass('selected');
  }

  // SELECT MODE
  function enableSelectMode() {
    clearModes();
    $('#select').addClass('selected');
  }

  // HAND MODE
  function enableHandMode() {
    clearModes();
    canvas.discardActiveObject();
    $('#hand').addClass('selected');
    handMode = true;
    canvas.forEachObject(function(o) {
      o.set({
        selectable: false
      });
    });
}

  // ERASER MODE
  function enableEraserMode() {
    let currentSelection = canvas.getActiveObjects();
    if (currentSelection.length > 0) {
      removeComponent();
      enableSelectMode();
    } else {
      clearModes();
      $('#delete').addClass('selected');
      eraserMode = true;
    }
  }

  // RECTANGLE MODE
  function enableRectMode() {
    clearModes()
    canvas.discardActiveObject();
    $('#draw-rect').addClass('selected');
    rectangeMode = true;
    canvas.forEachObject(function(o) {
      o.set({
        selectable: false
      });
    });
  }


  ////////////////////////////////////////////
  //             CANVAS EVENTS              //
  ////////////////////////////////////////////
  canvas.on('text:changed', function(event) {
    // debouncing not required.
    modifyingComponent(event.target)
  });

  canvas.on('mouse:up', function(event) {
    if (currentMoveTimeout) {
      clearTimeout(currentMoveTimeout)
    }
    if (eraserMode) {
      removeComponent();
    }
  });

  ['object:rotating', 'object:moving', 'object:scaling', 'object:modified']
    .forEach(function(eventType) {
      canvas.on(eventType, function(event) {
        componentChanged(event)
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
    if (DEBUG) console.log("PATH CREATED:", path);
    socket.emit("path_created", path.toJSON())
  });

  /// MOUSE DOWN EVENT
  let rect, isDown, origX, origY;
  canvas.on('mouse:down', function(o) {
    if (rectangeMode) {
      canvas.selection = false;
      isDown = true;
      var pointer = canvas.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;
      var pointer = canvas.getPointer(o.e);
      rect = new fabric.Rect({
        selectable: true,
        hasControls: true,
        left: origX,
        top: origY,
        originX: 'left',
        originY: 'top',
        width: pointer.x - origX,
        height: pointer.y - origY,
        angle: 0,
        fill: currentColor,
        transparentCorners: false
      });
      canvas.add(rect).setActiveObject(rect);
    }

    if (handMode) {
      canvas.selection = false;
      let evt = o.e;
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }

  });

  // MOUSE MOVE EVENT
  canvas.on('mouse:move', function(o) {
    if (rectangeMode) {
      if (!isDown) return;
      let pointer = canvas.getPointer(o.e);
      if (origX > pointer.x) {
        rect.set({
          left: Math.abs(pointer.x)
        });
      }
      if (origY > pointer.y) {
        rect.set({
          top: Math.abs(pointer.y)
        });
      }
      rect.set({
        width: Math.abs(origX - pointer.x)
      });
      rect.set({
        height: Math.abs(origY - pointer.y)
      });
      canvas.renderAll();
    }
    if (handMode) {
      if (this.isDragging) {
        var e = o.e;
        this.viewportTransform[4] += e.clientX - this.lastPosX;
        this.viewportTransform[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    }
  });

  // MOUSE UP EVENT
  canvas.on('mouse:up', function(e) {
    if (rectangeMode) {
      isDown = false;
      enableSelectMode();
      addComponent(rect);
    }
    if (handMode) {
      this.isDragging = false;
      this.selection = true;
    }
    if (eraserMode) {
      removeComponent();
    }
    if (currentMoveTimeout) {
      clearTimeout(currentMoveTimeout)
    }
  });

  // Zoom in/out with mousewheel
  canvas.on('mouse:wheel', function(opt) {
    var delta = opt.e.deltaY;
    var pointer = canvas.getPointer(opt.e);
    var zoom = canvas.getZoom();
    zoom = zoom - delta / 200;
    if (zoom > 5) zoom = 5;
    if (zoom < 0.5) zoom = 0.5;
    canvas.zoomToPoint({
      x: opt.e.offsetX,
      y: opt.e.offsetY
    }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // component changed
  function componentChanged(event) {
    // tbd debounce instead of trottling
    if (event.target.type === "activeSelection") {
      setTimeout(function() { groupUpdate(event.target, "modify") }, 25);
      } else {
      setTimeout(function() { modifyingComponent(event.target) }, 25);
    }
  }

  // selection group changend
  function groupUpdate(group, method) {
    var ids = group.getObjects().map(e => e.id);
    group.clone(function(clonedObj) {
      clonedObj._restoreObjectsState();
      clonedObj.getObjects().forEach(function(each, i) {
        let cloned = each;
        cloned.id = ids[i];   // restore custom IDs
        if(method === "modify") modifyingComponent(cloned)
        if(method === "create") addComponent(cloned, true)
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
    component.id = uuidv4();
    if (!ignoreCanvas) canvas.add(component);
    socket.emit('create_component', component.toJSON());
  };

  // Remove component
  function removeComponent() {
    let currentSelection = canvas.getActiveObjects();
    canvas.getActiveObjects().forEach(obj => {
      canvas.remove(obj);
      socket.emit("remove_component", {
        id: obj.id
      })
    });
  }

  var currentMoveTimeout;

  function modifyingComponent(component) {
    if (DEBUG) console.log("Modifying Component", component)
    let param = {
      id: component.id,
      type: component.type,
      left: component.left,
      top: component.top,
      scaleX: component.scaleX,
      scaleY: component.scaleY,
      angle: component.angle,
      text: component.text
    };
    if (DEBUG) console.log("Modify", component)
    socket.emit("modify_component", param)
    if (DEBUG) console.log("moving", param, component)
  };

  // path created received from server
  socket.on('path_created', function(path) {
    if (DEBUG) console.log('incoming', path);
    fabric.util.enlivenObjects([path], function(objects) {
      objects.forEach(function(p) {
        canvas.add(p);
      });
    });
  });

  // draw component received from server
  socket.on('create_component', function(data) {
    if (DEBUG) console.log("incomding add", data)
    fabric.util.enlivenObjects([data], function(objects) {
      objects.forEach(function(p) {
        canvas.add(p);
      });
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

  function findComonent(id) {
    return canvas.getObjects().find((each) => each.id === id)
  }

  // modify component received from server
  socket.on('modify_component', function(data) {
    if (DEBUG) console.log("receiving modifying data", data)
    let targetComponent = findComonent(data.id)
    if (DEBUG) console.log("receiving modifying on comp", targetComponent)
    if (targetComponent) {
      targetComponent.left = data.left;
      targetComponent.top = data.top;
      targetComponent.scaleX = data.scaleX;
      targetComponent.scaleY = data.scaleY;
      targetComponent.angle = data.angle;
      targetComponent.set("text",data.text);
      canvas.renderAll();
    } else {
      if (DEBUG) console.log("Unknown Component Modified.", data)
    }
  });




  //////////////////////////////////////////
  //              COPY PASTE              //
  //////////////////////////////////////////

  $('#duplicate').on('click', function(e) {
    if (canvas.getActiveObject())
      Copy();
    Paste();
  });

  // $('#copy').on('click', function(e) {
  //   if(canvas.getActiveObject())
  //     Copy();
  // });
  // $('#paste').on('click', function(e) {
  //   Paste();
  // });

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
