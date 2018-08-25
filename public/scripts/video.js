document.addEventListener("DOMContentLoaded", function() {

  const canvas = document.getElementById('canvas1');
  const context = canvas.getContext('2d');
  const video = document.getElementById('video1');
  const vendorURL = window.URL;

  navigator.getMedia = navigator.getUserMedia;

  navigator.getMedia({
    video: true,
    audio: false
  }, function(stream) {
    video.src = vendorURL.createObjectURL(stream);
    video.play();
  }, function(error) {
    console.log("An error occurred:", error);
    // Error.code?
  });
});