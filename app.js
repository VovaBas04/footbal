const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера

let teamName = "Supercomputer" // Имя команды
let enemyTeamName = "Bots"
let agent = new Agent(true);// Создание экземпляра агента
let enemy = new Agent();

require('./socket')(agent, teamName, VERSION)
require('./socket')(enemy, enemyTeamName, VERSION)
const coors = process.argv.slice(2,4)
const agle = process.argv[4]

setTimeout(function () {
    agent.socketSend("move", coors.join(' '))
    enemy.socketSend("move", "-10 20")
    setTimeout(function () {
        enemy.socketSend("turn", "180")
    })
    setInterval(function () {
        agent.socketSend("turn", agle / 10)
    }, 100)
}, 1000)

process.on('SIGINT', () => {
    agent.socketSend("bye", "")
    // Здесь можно добавить свой код при обработке сигнала
    process.exit(); // Завершаем процесс
});


// setTimeout(() => {
//     console.log("Тут")
// }, 5000)// Размещение игрока на поле