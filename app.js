const Agent = require('./agent');
const getTree = require("./chooseAction.js");
let chooseTree = require('./chooseTree.js');
let goalieTree = require('./goalie.js');
// const Controller = require('./controller'); // Импорт контроллера
const VERSION = 7; // Версия сервера

let teamName = "Supercomputer"; // Имя команды
const enemyName = "Bots"
let agent = new Agent(true); // Создание экземпляра агента
let agent2 = new Agent(true);
let agent3 = new Agent(true);
let goalie = new Agent(false);
goalie.setTree(goalieTree)
setTimeout(() => {
    setInterval(() => {
        console.log("Давай определю")
        let sensorsData = [
            agent.getSensorData(),
            agent2.getSensorData(),
            agent3.getSensorData(),
        ]
        if (sensorsData.find((item) => !item) === null && sensorsData.find((item) => item))  {
            agent.setTree(null)
            agent2.setTree(null)
            agent3.setTree(null)
            console.log("Тут")
            return
        }

        console.log(sensorsData.find((item) => !item), sensorsData.find((item) => item))

        if (sensorsData[0] && agent.getRun()) {
            command = getTree(chooseTree, sensorsData)
            console.log("Тут", chooseTree.state.next)
            if (command.type === 'tree') {
                chooseTree.state.next++
                agent.setTree(command.value[0])
                agent2.setTree(command.value[1])
                agent3.setTree(command.value[2])
            } else {
                agent.setAct(command.value[0])
                agent2.setAct(command.value[1])
                agent3.setAct(command.value[2])
            }
        }
    }, 100)
},3000)

require('./socket')(agent, teamName, VERSION);
require('./socket')(agent2, teamName, VERSION);
require('./socket')(agent3, teamName, VERSION);
require('./socket')(goalie, enemyName, VERSION, true);

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
    agent2.socketSend("move", coors2);
    agent3.socketSend("move", coors3);
}, 1000);
setTimeout(function () {
    agent2.socketSend("turn", "60");
}, 2000);

process.on('SIGINT', () => {
    agent.socketSend("bye", "");
    agent2.socketSend("bye", "");
    agent3.socketSend("bye", "")
    // Здесь можно добавить свой код при обработке сигнала
    process.exit(); // Завершаем процесс
});
