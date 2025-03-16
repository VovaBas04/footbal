const Agent = require('./agent'); // Импорт агента
const Controller = require('./controller'); // Импорт контроллера
const VERSION = 7; // Версия сервера

let teamName = "Supercomputer"; // Имя команды
let agent0 = new Agent(true);
let agent = new Agent(true)// Создание экземпляра агента

require('./socket')(agent0, teamName, VERSION);
require('./socket')(agent, "ABOBA", VERSION, true);

// Инициализируем контроллер с последовательностью действий:
// Движение к флагам "frb", "gl", "fc", затем удар по мячу (цель – ворота "gr")
agent.controller = new Controller([
    {act: "flag", fl: "gl"},
    {act: "flag", fl: "flt"},
    {act: "flag", fl: "fcb"},
    {act: "kick", fl: "b", goal: "gr"}
], agent);

const coors = "-20 0";

setTimeout(function () {
    agent.socketSend("move", coors);
}, 1000);

process.on('SIGINT', () => {
    agent.socketSend("bye", "");
    // Здесь можно добавить свой код при обработке сигнала
    process.exit(); // Завершаем процесс
});
