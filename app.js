const Agent = require('./agent'); // Импорт агента
const Controller = require('./controller'); // Импорт контроллера
const VERSION = 7; // Версия сервера

const goalieTree = require('./goalie.js')

let teamName = "Supercomputer"; // Имя команды
let agent0 = new Agent();
let agent = new Agent()// Создание экземпляра агента


// Инициализируем контроллер с последовательностью действий
agent.controller = new Controller([], true, goalieTree); // true для включения вывода отладочной информации

agent0.controller = new Controller([
    {act: "flag", fl: "gl"},
    {act: "flag", fl: "flt"},
    {act: "flag", fl: "fcb"},
    {act: "kick", fl: "b", goal: "gr"}
], true);

require('./socket')(agent0, teamName, VERSION);
require('./socket')(agent, "ABOBA", VERSION, true);

const coors0 = "-20 0";
const coors = "-20 0";

setTimeout(function () {
    agent0.socketSend("move", coors0);
    agent.socketSend("move", coors);
}, 1000);

process.on('SIGINT', () => {
    agent0.socketSend("bye", "");
    agent.socketSend("bye", "");
    process.exit();
});
