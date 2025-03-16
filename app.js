const Agent = require('./agent'); // Импорт агента
const Controller = require('./controller'); // Импорт контроллера
const VERSION = 7; // Версия сервера

const goalieTree = require('./trees/goalie.js')

let teamName = "Supercomputer"; // Имя команды
let enemyName = "Sinep";
let passer = new Agent();
let scorer = new Agent();
let enemy1  = new Agent();
let enemy2 = new Agent();


// Инициализируем контроллер с последовательностью действий
passer.controller = new Controller();
scorer.controller = new Controller();
enemy1.controller = new Controller();
enemy2.controller = new Controller();

require('./socket')(passer, teamName, VERSION);
require('./socket')(scorer, teamName, VERSION);
require('./socket')(enemy1, enemyName, VERSION);
require('./socket')(enemy2, enemyName, VERSION);


const passerCoors = "-10 10";
const scorerCoors = "-10 -10";
const enemy1Coors = "-52.5 7.01";
const enemy2Coors = "-52.5 -7.01";

setTimeout(function () {
    passer.socketSend("move", passerCoors);
    scorer.socketSend("move", scorerCoors);
    enemy1.socketSend("move", enemy1Coors);
    enemy2.socketSend("move", enemy2Coors);
}, 1000);

process.on('SIGINT', () => {
    passer.socketSend("bye", "Passer Bye!");
    scorer.socketSend("bye", "Scorer Bye!");
    enemy1.socketSend("bye", "Enemy1 Bye!");
    enemy2.socketSend("bye", "Enemy2 Bye!");
    process.exit();
});
