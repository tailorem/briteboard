// $(document).ready(() => {

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

let webrtcVar;

function getVideo() {
  const roomURL = window.location.pathname.split('/')[2];

  const webrtc = new SimpleWebRTC({
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

  webrtc.on('readyToCall', function () {
    webrtc.joinRoom(roomURL);
  });

  webrtcVar = webrtc;
}

function toggleVideo(videoOn) {
  if (videoOn === true) {
    webrtcVar.pause();
    videoOn = false;
  } else {
    webrtcVar.resume();
    videoOn = true;
  }
}

// });


  // toggleVideo = () => {
  //   if (this.state.videoOn) {
  //     this.webrtc.pauseVideo()
  //     this.setState({
  //       videoOn: false
  //     })
  //   } else {
  //     this.webrtc.resumeVideo()
  //     this.setState({
  //       videoOn: true
  //     })
  //   }
  // }
