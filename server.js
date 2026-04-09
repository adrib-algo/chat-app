const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend
app.use(express.static("public"));

// Socket connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Receive message
    socket.on("chat message", (msg) => {
        console.log("Message:", msg);

        // Send to all users
        io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});