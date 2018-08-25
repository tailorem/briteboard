document.addEventListener("DOMContentLoaded", function() {

  let canvas = new fabric.Canvas('whiteboard');
  canvas.setHeight(window.innerHeight);
  canvas.setWidth(window.innerWidth);

  // Set default canvas values
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = '#000000';
  let currentWidth = canvas.freeDrawingBrush.width = 10;
  let currentColor = '#000000';

  // Drag and drop to add image functionality
  $('.main').on('drop', function(e) {
    console.log(e);

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
        console.log('second event:', e);
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

  // Select Tool
  $('#select').on('click', function(e) {
    $(".selected").removeClass("selected");
    $(this).addClass('selected');
    canvas.isDrawingMode = false;
  });

  // Draw Tool
  $('#draw').on('click', function(e) {
    $(".selected").removeClass("selected");
    $(this).addClass('selected');
    canvas.isDrawingMode = true;
  });

  // Circle Tool
  $('#circle').on('click', function(e) {
    $(".selected").removeClass("selected");
    $('#select').addClass('selected');
    canvas.isDrawingMode = false;
    addComponent(new fabric.Circle({
      left: 100,
      top: 100,
      radius: 75,
      fill: currentColor
    }));
  });

  // Square Tool
  $('#square').on('click', function(e) {
    $(".selected").removeClass("selected");
    $('#select').addClass('selected');
    canvas.isDrawingMode = false;
    addComponent(new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: currentColor
    }));
  });

  // Delete Tool
  $('#delete').on('click', function(e) {
    $(".selected").removeClass("selected");
    $('#select').addClass('selected');
    canvas.isDrawingMode = false;
    canvas.getActiveObjects().forEach(obj => {
      removeComponent(obj)
    });
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
        canvas.add(image);
      };
    };
    reader.readAsDataURL(e.target.files[0]);
    canvas.isDrawingMode = false;
    $("#add-image").val("");
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

  var components = [];
  var socket = io.connect();

  function addComponent(component) {
    component.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          id: this.id
        });
      };
    })(component.toObject);

    component.id = nextObjID
    canvas.add(component);
    components.push(component);
    send_to_server(component);
  };

  function removeComponent(component) {
    canvas.remove(component);
    socket.emit("remove_component", component.id)
  }

  var currentMoveTimeout;

  function modifyingComponent(component) {
    let param = {
      id: component.id,
      left: component.left,
      top: component.top,
      scaleX: component.scaleX,
      scaleY: component.scaleY,
      angle: component.angle
    };
    socket.emit("modify_component", param)
    // console.log("Modify Component", param)
  };

  canvas.on('mouse:up', function(options) {
    if (currentMoveTimeout) {
      clearTimeout(currentMoveTimeout)
    }
  });
  canvas.on('mouse:down', function(options) {
    canvas.on('mouse:move', function(options) {
      if (options.target) {
        // console.log("component", options.target);
        // console.log("selected objects", canvas.getActiveObjects());
        // console.log("options.target.objects", options.target.objects)
        // TBD

        modifyingComponent(options.target)

        // setTimeout(function() {
        //   modifyingComponent(options.target) }, 25);
      }
    })
  });

  var nextObjID;
  socket.on('init_session', function(data) {
    nextObjID = data.nextObjID;
  });

  // send component to server
  function send_to_server(component) {
    // console.log("sending data", component)
    socket.emit('push_component', {
      id: component.id,
      rawData: JSON.stringify(component.canvas)
    });
  }

  // draw component received from server
  socket.on('add_component', function(data) {
    // console.log("receiving data", data)
    canvas.loadFromJSON(data)
    // console.log("incoming data", data)
    canvas.renderAll()

    // component.push(JSON.parse(data))
    // console.log("Canvas", canvas)
    // console.log("Objects", canvas.getObjects())
  });
  // modify component received from server
  socket.on('update_component', function(data) {
    // console.log("receiving modifying data", data)
    let targetComponent = canvas.getObjects().find((each) => each.id === data.id)
    targetComponent.left = data.left;
    targetComponent.top = data.top;
    targetComponent.scaleX = data.scaleX;
    targetComponent.scaleY = data.scaleY;
    targetComponent.angle = data.angle;
    canvas.renderAll();

    // console.log("component", targetComponent)
    // console.log("components", canvas.getObjects())
    // console.log("component = id", canvas.getObjects()[0].id, data.id)
  });

});
