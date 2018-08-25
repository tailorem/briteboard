

document.addEventListener("DOMContentLoaded", function() {

  let canvas = new fabric.Canvas('whiteboard');
  canvas.setHeight(window.innerHeight);
  canvas.setWidth(window.innerWidth);

  // Set default canvas values
  enableDrawingMode();
  canvas.freeDrawingBrush.color = '#000000';
  let currentWidth = canvas.freeDrawingBrush.width = 15;
  let currentColor = '#000000';

  // Drag and drop to add image functionality
  $('.board').on('drop', function(e) {
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
    disableDrawingMode();
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
    disableDrawingMode();
  });

  // Square Tool
  $('#square').on('click', function(e) {
    addComponent(new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: currentColor
    }));
    disableDrawingMode();
  });

  // Text box
  $('#textbox').on('click', function(e) {
    addComponent(new fabric.Textbox('MyText', {
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
    disableDrawingMode();
  });

  // Delete Tool
  $('#delete').on('click', function(e) {
    canvas.getActiveObjects().forEach(obj => {
      removeComponent(obj)
    });
    disableDrawingMode();
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
    $("#add-image").val("");
    disableDrawingMode();
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

  // Enable and disable drawing mode functions
  function enableDrawingMode() {
    canvas.isDrawingMode = true;
    $(".selected").removeClass("selected");
    $('#draw').addClass('selected');
  }

  function disableDrawingMode() {
    canvas.isDrawingMode = false;
    $(".selected").removeClass("selected");
    $('#select').addClass('selected');
  }


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
    component.id = uuidv4();
    canvas.add(component);
    components.push(component);
    socket.emit('push_component', {
      id: component.id,
      rawData: JSON.stringify(component.canvas)
    });
  };

  function removeComponent(component) {
    console.log("Delete", component)
    canvas.remove(component);
    socket.emit("remove_component", {
      id: component.id
    })
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
    console.log("moving", param, component)
  };

  canvas.on('mouse:up', function(event) {
    if (currentMoveTimeout) {
      clearTimeout(currentMoveTimeout)
    }

  });
  canvas.on('mouse:down', function(event) {
    canvas.on('object:moving', function(event) {
      if (event.target) {
          setTimeout(function() {
            modifyingComponent(event.target) }, 25);
      }
    })
  });

  // draw component received from server
  socket.on('add_component', function(data) {
    console.log("incomding add", JSON.parse(data.rawData))
    components.push(JSON.parse(data.rawData));
    canvas.loadFromJSON(data.rawData)
    canvas.renderAll()
  });

  // delete component request from server
  socket.on('delete_component', function (data) {
    console.log("receiving data", data)
    let component = findComonent(data.id)
    if (component) {
      canvas.remove(component);
      canvas.renderAll()
    }
  });

  function findComonent(id) {
    return canvas.getObjects().find((each) => each.id === id)
  }

  // modify component received from server
  socket.on('update_component', function(data) {
    console.log("receiving modifying data", data)
    let targetComponent = findComonent(data.id)
    if (targetComponent) {
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
  canvas.on('mouse:up', function(event) {
    let objects = canvas.getActiveObjects();
    console.log("Current Objects", objects)
  })
});
