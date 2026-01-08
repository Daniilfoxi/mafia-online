// 1. Подключаемся к серверу
const socket = io();

const connectionStatus = document.getElementById('connection');
const onlineCount = document.getElementById('online-count');
const testBtn = document.getElementById('test-btn');

// 2. Слушаем событие успешного подключения
socket.on('connect', () => {
    console.log("Успешно подключено к серверу!");
    connectionStatus.innerText = "CONNECTED";
    connectionStatus.style.color = "#4cd964";
});

// 3. Слушаем обновление онлайна от сервера
socket.on('update_online', (count) => {
    onlineCount.innerText = count;
});

// 4. Слушаем сигнал о "захвате" от другого игрока
socket.on('point_captured', (data) => {
    console.log("Кто-то захватил точку:", data);
    document.body.style.backgroundColor = "#2c3e50"; // Меняем фон при событии
    setTimeout(() => {
        document.body.style.backgroundColor = "#111";
    }, 500);
    
    alert(`Игрок ${data.playerName} захватил точку #${data.pointId}!`);
});

// 5. Отправка своего сигнала при нажатии на кнопку
testBtn.onclick = () => {
    const fakeData = {
        pointId: Math.floor(Math.random() * 10),
        playerName: "Player_" + socket.id.substring(0, 4)
    };
    
    // Отправляем событие на сервер
    socket.emit('capture_attempt', fakeData);
};