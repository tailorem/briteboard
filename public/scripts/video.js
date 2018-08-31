$(document).ready(() => {
  const room = window.location.pathname.split('/')[2];
  console.log(room);
});


// document.addEventListener("DOMContentLoaded", function() {

//   const canvas = document.getElementById('canvas1');
//   const context = canvas.getContext('2d');
//   const video = document.getElementById('video1');
//   const vendorURL = window.URL;

//   navigator.getMedia = navigator.getUserMedia;

//   navigator.getMedia({
//     video: true,
//     audio: false
//   }, function(stream) {
//     video.src = vendorURL.createObjectURL(stream);
//     video.play();
//   }, function(error) {
//     console.log("An error occurred:", error);
//     // Error.code?
//   });
// });


// const mediaSource = new MediaSource();
// const video = document.createElement('video');
// video.srcObject = mediaSource;

// const mediaSource = new MediaSource();
// const video = document.createElement('video');
// try {
//   video.srcObject = mediaSource;
// } catch (error) {
//   video.src = URL.createObjectURL(mediaSource);
// });