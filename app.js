const Agent = require('./agent');
let mainTree = require('./mainTree.js');
let supportTree = require('./supportTree.js');
let goalieTree = require('./goalie.js');
const Controller = require('./controller'); // Импорт контроллера
const VERSION = 7; // Версия сервера

let teamName = "Supercomputer"; // Имя команды
const enemyName = "Bots"
let agent = new Agent(true); // Создание экземпляра агента
let controller = new Controller([], agent)
// let agent2 = new Agent(true);
// let agent3 = new Agent(true);
// let goalie = new Agent(false);
// goalie.setTree(goalieTree)
// agent.setTree(mainTree)
// agent2.setTree(supportTree)

require('./socket')(agent, teamName, VERSION);
// require('./socket')(agent2, teamName, VERSION);
// require('./socket')(agent3, teamName, VERSION);
// require('./socket')(goalie, enemyName, VERSION, true);

// Инициализируем контроллер с последовательностью действий:
// Движение к флагам "frb", "gl", "fc", затем удар по мячу (цель – ворота "gr")
// agent.controller = new Controller([
//     {act: "flag", fl: "gl"},
//     {act: "flag", fl: "flt"},
//     {act: "flag", fl: "fcb"},
//     {act: "kick", fl: "b", goal: "gr"}
// ], agent);

const coors = "-20 20";
const coors2 = "-30 25";
const coors3 = "-30 0";

setTimeout(function () {
    agent.socketSend("move", coors);
    // agent2.socketSend("move", coors2);
    // agent3.socketSend("move", coors3);
}, 1000);
setTimeout(function () {
    // agent2.socketSend("turn", "60");
}, 2000);

process.on('SIGINT', () => {
    agent.socketSend("bye", "");
    // agent2.socketSend("bye", "");
    // agent3.socketSend("bye", "")
    // Здесь можно добавить свой код при обработке сигнала
    process.exit(); // Завершаем процесс
});
