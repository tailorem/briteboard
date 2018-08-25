document.addEventListener("DOMContentLoaded", function() {

  let canvas = new fabric.Canvas('whiteboard');
  canvas.setHeight(window.innerHeight);
  canvas.setWidth(window.innerWidth);

  // Set default canvas values
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = '#000000';
  let currentWidth = canvas.freeDrawingBrush.width = 10;
  let currentColor = '#000000';

  // Select Tool
  $('#select').on('click', function (e) {
    $(".selected").removeClass("selected");
    $(this).addClass('selected');
    canvas.isDrawingMode = false;
  });

  // Draw Tool
  $('#draw').on('click', function (e) {
    $(".selected").removeClass("selected");
    $(this).addClass('selected');
    canvas.isDrawingMode = true;
  });

  // Circle Tool
  $('#circle').on('click', function (e) {
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
  $('#square').on('click', function (e) {
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

    // Text box
    $('#textbox').on('click', function (e) {
      $(".selected").removeClass("selected");
      $('#select').addClass('selected');
        canvas.isDrawingMode = false;
        addComponent(new fabric.Textbox('MyText', {
          width: 300,
          height: 300,
          top: 5,
          left: 5,
          hasControls: false,
          fontSize: 30,
          fixedWidth: 300,
          fixedFontSize: 30
        }))
    });

  // Delete Tool
  $('#delete').on('click', function (e) {
    $(".selected").removeClass("selected");
    $('#select').addClass('selected');
    canvas.isDrawingMode = false;
    canvas.getActiveObjects().forEach(obj => { removeComponent(obj) });
  });

  // Color Picker
  $("#colorPicker").spectrum({
    color: currentColor,
    showPalette: true,
    palette: [
        ['#000000', '#ffffff'],
        ['#FF4136','#0074D9'],
        ['#2ECC40','#f9f878'],
        ['#be50b7', '#FF851B' ],
        ['#39CCCC', '#AAAAAA' ]
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
    console.log("Delete", component)
    canvas.remove(component);
    socket.emit("remove_component", {id: component.id})
  }

  var currentMoveTimeout;
  function modifyingComponent(component) {
    let param = {id: component.id,
            left: component.left,
            top: component.top,
            scaleX: component.scaleX,
            scaleY: component.scaleY,
            angle: component.angle};
    socket.emit("modify_component", param)
    // console.log("Modify Component", param)
  };

  canvas.on('mouse:up', function(options) {
    if(currentMoveTimeout) {
      clearTimeout(currentMoveTimeout)
    }

  });
  canvas.on('mouse:down', function(options) {
    canvas.on('object:moving', function(options) {  
      if (options.target) {
        // console.log("component", options.target);
        // console.log("selected objects", canvas.getActiveObjects());
        // console.log("options.target.objects", options.target.objects)
        // TBD

          // modifyingComponent(options.target)
console.log("moving - options.target", options.target)
          setTimeout(function() {
            modifyingComponent(options.target) }, 100);
      }
    })
  });

  var nextObjID;
  socket.on('init_session', function (data) {
    nextObjID = data.nextObjID;
  });

  // send component to server
  function send_to_server(component) {
    // console.log("sending data", component)
    socket.emit('push_component', {id: component.id, rawData: JSON.stringify(component.canvas)});
  }

  // draw component received from server
  socket.on('add_component', function (data) {
    // console.log("receiving data", data)
    canvas.loadFromJSON(data)
    // console.log("incoming data", data)
    canvas.renderAll()

    // component.push(JSON.parse(data))
    // console.log("Canvas", canvas)
    // console.log("Objects", canvas.getObjects())
  });
  
  // delete component request from server
  socket.on('turf_component', function (data) {
    console.log("receiving data", data)
    let component = findComonent(data.id)
    if(component) {
      canvas.remove(component);
      canvas.renderAll()
    }
  });

  function findComonent(id) {
    return canvas.getObjects().find((each) => each.id === id)
  }

  // modify component received from server
  socket.on('update_component', function (data) {
    console.log("receiving modifying data", data)
    let targetComponent = findComonent(data.id)
    if(targetComponent) {
      targetComponent.left = data.left;
      targetComponent.top = data.top;
      targetComponent.scaleX = data.scaleX;
      targetComponent.scaleY = data.scaleY;
      targetComponent.angle = data.angle;
      canvas.renderAll();
    } else {
      console.log("component", targetComponent)
      console.log("components", canvas.getObjects())
      console.log("component = id", canvas.getObjects()[0].id, data.id)
      console.log("Update Component??", data) 
    }
 

  });

});
