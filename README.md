# Briteboard - Final Project

https://briteboard.herokuapp.com/

#### Main contributors: [Aaron Ford](https://github.com/aaronfordnet), [Paul Lo](https://github.com/LoPaul), [Taylour Kroeker](https://github.com/tailorem)

## Overview

An online collaborative whiteboard application for creative sketching, diagramming, and planning, built as our final group project at Lighthouse Labs. Users can new boards (no registration required) using provided starter templates, and then share the link to their board with friends and colleagues. Users collaborate by freehand drawing, adding shapes, text and images, and communicate via voice and video chat. Boards and their current state are saved in a database so they can be revisited at any time, or deleted when no longer needed.

## Getting Started

1. Make sure you have installed [Node.js & npm](https://nodejs.org/en/)
1. Fork and clone this repository
1. Install all dependencies in the root folder by running ``npm install``
1. In ``db/config``, rename ``keys_example.js`` to ``keys.js`` and add your mongoURI to connect your database
1. Then start the server with ``npm run server``
1. Run ``open http://localhost:3000`` OR navigate to ``http://localhost:3000/`` in your browser to see the app running

## Final Product

!["Landing page"](https://github.com/LoPaul/Sketcher/blob/master/docs/landing.png?raw=true)
!["Demo board"](https://github.com/LoPaul/Sketcher/blob/master/docs/demo.png?raw=true)

## Tech Stack

- Node.js
- Express
- EJS
- jQuery
- Bootstrap
- Socket.IO
- Fabric.js
- FileSaver
- SimpleWebRTC
- MongoDB
- Mongoose
- Heroku

## Next Steps
- Prevent stacking of error dialog boxes on socket disconnect
- Improve error handling for socket disconnection (graceful reconnection instead of error dialog boxes)
- Minimize socket disconnections by reducing information transfer
- Allow users to pause remote video streams
- Add 'clear' and 'fill' functions