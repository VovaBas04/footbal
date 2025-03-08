const dgram = require('dgram') // Модуль для аботы с UDP
module.exports = function(agent, teamName, version, isGoalie = false) {
    // Создание сокета
    const socket = dgram.createSocket({type: 'udp4', reuseAddr: true})
    agent.setSocket(socket) // Задание сокета для агента
    socket.on('message', (msg, info) => {
        agent.msgGot(msg) // Обработка полученного сообщения
    })
    socket.sendMsg = function(msg) { // Отравка сообщения серверу
        socket.send(Buffer.from(msg), 6000, 'localhost', (err, bytes) => {
            if (err) throw err
        })
    }
    // Инициализация игрока на сервере (без параметра goalie)
    let goalie = ""
    if (isGoalie) {
        goalie = "(goalie)"
    }
    socket.sendMsg(`(init ${teamName} (version ${version}) ${goalie})`)
}