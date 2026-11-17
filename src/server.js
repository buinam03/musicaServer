const http = require('http');
const { Server } = require('socket.io');
const env = require('./config/env');
const { connectDatabase } = require('./config/db');
require('./models'); // đăng ký associations trước khi xử lý request
const { createApp, corsOptions } = require('./app');
const registerChatSocket = require('./sockets/chat.socket');

async function bootstrap() {
    try {
        await connectDatabase();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }

    const app = createApp();
    const server = http.createServer(app);
    const io = new Server(server, { cors: corsOptions });

    registerChatSocket(io);

    server.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
}

bootstrap();
