////////////////////////////////////////////
//             USER HELPERS               //
////////////////////////////////////////////

  function getUsername(socket) {

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

  }

  function listUsers(users) {
    $users = $('#users');
    users.forEach(function(user) {
      user = user[Object.keys(user)[0]];
      if (user.name) {
        $(`<span class="user-name ${user.id}">`).text(user.name).appendTo($users);
      }
    });
  }

  function getCursors(users) {
    $container = $("div.container");
    users.forEach(function(user) {
      user = user[Object.keys(user)[0]];
      if (user.name) {
        $(`<span id="${user.id}" class="user-cursor">`).text(user.name).appendTo($container);
      }
    });
  }

  function addUser(user) {
    $users = $('#users');
    $(`<span class="user-name ${user.id}">`).text(user.name).appendTo($users);
  }

  function addCursor(user) {
    $container = $("div.container");
    $(`<span id="${user.id}" class="user-cursor ${user.id}">`).text(user.name).appendTo($container);
  }

  function removeUser(user) {
    $(`span.${user.id}`).remove();
    $(`span#${user.id}`).remove();
  }

////////////////////////////////////////////
//             VIDEO HELPERS              //
////////////////////////////////////////////

function toggleVideo(webrtc, videoOn) {
  if (videoOn === true) {
    webrtc.pause();
    videoOn = false;
  } else {
    webrtc.resume();
    videoOn = true;
  }
  return videoOn;
}

function getVideo(webrtc) {
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
  return webrtc;
}


