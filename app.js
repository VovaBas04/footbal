const Agent = require('./agent'); // Импорт агента
const Controller = require('./controller'); // Импорт контроллера
const VERSION = 7; // Версия сервера

let teamName = "Supercomputer"; // Имя команды
let agent0 = new Agent();
let agent = new Agent()// Создание экземпляра агента


// Инициализируем контроллер с последовательностью действий
agent.controller = new Controller([
    {act: "flag", fl: "gl"},
    {act: "flag", fl: "flt"},
    {act: "flag", fl: "fcb"},
    {act: "kick", fl: "b", goal: "gr"}
], true); // true для включения вывода отладочной информации

require('./socket')(agent0, teamName, VERSION);
require('./socket')(agent, "ABOBA", VERSION, true);

const coors = "-20 0";

setTimeout(function () {
    agent.socketSend("move", coors);
}, 1000);

process.on('SIGINT', () => {
    agent.socketSend("bye", "");
    process.exit();
});
