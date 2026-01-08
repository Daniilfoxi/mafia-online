const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Подключаем Socket.io с настройками CORS для работы в Telegram
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Раздаем статику (твой фронтенд) из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Объект, где будем хранить состояние карты: кто что захватил
// Пример: { "point_1": "Daniil", "point_2": "Ivan" }
let cityState = {};
let onlineCount = 0;

io.on('connection', (socket) => {
    onlineCount++;
    console.log(`Игрок подключился. Всего в сети: ${onlineCount}`);

    // Сразу отправляем новому игроку текущую карту и его ID
    socket.emit('init', {
        cityState: cityState,
        onlinePlayers: onlineCount
    });

    // Оповещаем остальных, что игроков стало больше
    io.emit('update_online', onlineCount);

    // Слушаем событие захвата точки
    socket.on('capture_attempt', (data) => {
        // data = { pointId: 4, playerName: "Daniil" }
        cityState[data.pointId] = data.playerName;
        
        console.log(`Точка ${data.pointId} захвачена игроком ${data.playerName}`);

        // Рассылаем ВСЕМ обновление, чтобы у всех на картах сменился цвет
        io.emit('point_captured', {
            pointId: data.pointId,
            owner: data.playerName
        });
    });

    socket.on('disconnect', () => {
        onlineCount--;
        io.emit('update_online', onlineCount);
        console.log('Игрок отключился');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`ТЕСТОВЫЙ СЕРВЕР ЗАПУЩЕН НА ПОРТУ ${PORT}`);
});