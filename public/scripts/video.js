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

