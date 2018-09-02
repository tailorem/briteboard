////////////////////////////////////////////
//             USER HELPERS               //
////////////////////////////////////////////

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

function getVideo() {
  // $(document).ready(() => {
    const roomURL = window.location.pathname.split('/')[2];

    const webrtc = new SimpleWebRTC({
        localVideoEl: 'localVideo',
        remoteVideosEl: 'remoteVideos',
        autoRequestMedia: true
    });

    webrtc.on('readyToCall', function () {
        webrtc.joinRoom(roomURL);
    });
  // });
}

