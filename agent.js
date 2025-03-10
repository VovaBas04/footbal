const Msg = require('./msg')

const Flags = require('./flags')

const getAction = require('./action')

// Подключение модуля разбора сообщений от сервера
const readline = require('readline')
let i = false;
// Подключение модуля ввода из командной строки
class Agent {
    constructor(print = false) {
        this.decideTree = null
        this.print = print
        this.sensorData = null
        this.position = "1" // По умолчанию ~ левая половина поля
        this.run = false // Игра начата
        this.act = null // Действия
        this.r1 = readline.createInterface({ // Чтение консоли
            input: process.stdin,
            output: process.stdout
        })
        this.r1.on('line', (input) => { // Обработка строки из консоли
            if (this.run) { // Если игра начата
                // Движения вперед, вправо, влево, удар по мячу
                if("w" == input) this.act = {n: "dash", v: 100}
                if("d" == input) this.act = {n: "turn", v: 20}
                if("a" == input) this.act = {n: "turn", v: -20}
                if("s" == input) this.act = {n: "kick", v: 100}
            }
        })
        this.coords = {x: 0, y: 0}
    }
    msgGot(msg) { // Получение сообщения
        let data = msg.toString('utf8') // Приведение с строке
        this.processMsg(data) // Разбор сообщения
        this.sendCmd() // Отправка команды к строке
    }
    setSocket(socket) { // Настройка сокета
        this.socket = socket
    }
    socketSend(cmd, value) { // Отправка команды
        this.socket.sendMsg(`(${cmd} ${value})`)
    }
    processMsg(msg) {
        let data = Msg.parseMsg(msg);
        if (!data) throw new Error("Parse error\n" + msg);
        i = false;
        // Если получено сообщение hear, игра начинается и проверяем наличие сообщения о голе
        if (data.cmd == "hear") {
            this.run = true;
            if (data.msg.includes("goal")) {
                if (this.controller) {
                    this.controller.reset();
                }
            }
        }
        if (data.cmd == "init") this.initAgent(data.p);
        this.analyzeEnv(data.msg, data.cmd, data.p);
    }
    initAgent(p) {
        if(p[0] == "r") this.position = "r" // Правая половина поля
        if(p[1]) this.id = p[1] // id игрока
    }
    calculatePosition(x1, y1, x2, y2, x3, y3, d1, d2, d3, flag = false) {
        if (x1 === x2 && y1 === y2) {
            //не могу посчитать
            return this.coords
        }
        if (x1 === x2) {

            let y = (Math.pow(y2, 2) - Math.pow(y1, 2) + Math.pow(d1, 2) - Math.pow(d2, 2)) / (2 * (y2 - y1))
            let x_ans_1 = (2 * x1 + Math.sqrt(4 * d1 * d1 - 4 * Math.pow(y - y1, 2))) / 2
            let x_ans_2 = (2 * x1 - Math.sqrt(4 * d1 * d1 - 4 * Math.pow(y - y1, 2))) / 2
            if (Math.abs(x_ans_1 - this.coords.x) < Math.abs(x_ans_2 - this.coords.x)) {
                return {x : x_ans_1, y: y}
            } else {
                return {x : x_ans_2, y : y}
            }
        }

        if (y1 === y2) {
            let x = (Math.pow(x2, 2) - Math.pow(x1, 2) + Math.pow(d1, 2) - Math.pow(d2, 2)) / (2 * (x2 - x1))
            let y_ans_1 = (2 * y1 + Math.sqrt(4 * d1 * d1 - 4 * Math.pow(x - x1, 2))) / 2
            let y_ans_2 = (2 * y1 - Math.sqrt(4 * d1 * d1 - 4 * Math.pow(x - x1, 2))) / 2
            if (Math.abs(y_ans_1 - this.coords.y) < Math.abs(y_ans_2 - this.coords.y)) {
                return {x : x, y: y_ans_1}
            } else {
                return {x : x, y : y_ans_2}
            }
        }
        let alpha = (y1 - y2) / (x2 - x1)
        let beta = (y2 * y2 - y1 * y1 + x2 * x2 - x1 * x1 + d1 * d1 - d2 * d2) / (2 * (x2 - x1))
        let a = alpha * alpha + 1
        let b = -2 * (alpha * (x1 - beta) + y1)
        let c = Math.pow(x1 - beta, 2) + Math.pow(y1, 2) - Math.pow(d1, 2)
        // if (flag) {
        //     console.log("flags", x1, y1, x2, y2)
        // }

        let y_ans_1 = (-b + Math.sqrt(Math.pow(b, 2) - 4*a*c)) / (2*a)
        let y_ans_2 = (-b - Math.sqrt(Math.pow(b, 2) - 4*a*c)) / (2*a)
        let errorMin = 1000000
        let decide
        for (let y of [y_ans_1, y_ans_2]) {
            let x_ans_1 = x1 + Math.sqrt(Math.pow(d1, 2) - Math.pow(y - y1, 2))
            let x_ans_2 = x1 - Math.sqrt(Math.pow(d1, 2) - Math.pow(y - y1, 2))
            for (let x of [x_ans_1, x_ans_2]) {
                let error =  Math.abs(Math.pow(x - x3, 2) + Math.pow(y - y3, 2) - Math.pow(d3, 2))
                if (errorMin > error) {
                    errorMin = error
                    decide = {x : x, y : y}
                }
            }
        }
        return decide
    }
    chooseFlags(distancesOriginal) {
        let distances = [...distancesOriginal]
        for (let i = 0; i < distances.length; i++) {
            if (Flags[distances[i].key] === undefined) {
                distances.splice(i, 1)
                i--
            }
        }
        return {firstFlag : distances[0], secondFlag : distances[1 % distances.length], thirdFlag : distances[2 % distances.length]}
    }
    chooseFlagsForEnemy(distancesOriginal) {
        let distances = [...distancesOriginal]
        let firstFlag = ""
        for (let i = 0; i < distances.length; i++) {
            if (Flags[distances[i].key] === undefined) {
                if (distances[i].key.includes("\"") || distances[i].key === "p") {
                    firstFlag = distances[i]
                }
                distances.splice(i, 1)
                i--
            }
        }

        if (firstFlag === "") {
            return false
        }
        return {firstFlag : firstFlag, secondFlag : distances[0], thirdFlag : distances[1 % distances.length]}
    }
    analyzeEnv(msg, cmd) {
        if (cmd === "see") {
            try {
                let distances = Msg.parseSeeMsg(msg);
                let flagsForDistance = this.chooseFlags(distances);
                let firstFlag = flagsForDistance.firstFlag.key;
                let secondFlag = flagsForDistance.secondFlag.key;
                let thirdFlag = flagsForDistance.thirdFlag.key;
                let oldCoords = this.coords;
                this.coords = this.calculatePosition(Flags[firstFlag].x, Flags[firstFlag].y,
                    Flags[secondFlag].x, Flags[secondFlag].y,
                    Flags[thirdFlag].x, Flags[thirdFlag].y,
                    flagsForDistance.firstFlag.distance,
                    flagsForDistance.secondFlag.distance,
                    flagsForDistance.thirdFlag.distance);
                if (this.coords === undefined) {
                    this.coords = oldCoords;
                }
                let flagsForEnemy = this.chooseFlagsForEnemy(distances);
                if (flagsForEnemy) {
                    let secondFlag = flagsForEnemy.secondFlag.key;
                    let thirdFlag = flagsForEnemy.thirdFlag.key;
                    let da1 = Math.sqrt(Math.pow(flagsForEnemy.secondFlag.distance, 2) +
                        Math.pow(flagsForEnemy.firstFlag.distance, 2) -
                        2 * flagsForEnemy.firstFlag.distance * flagsForEnemy.secondFlag.distance *
                        Math.cos(Math.PI / 180 * Math.abs(flagsForEnemy.secondFlag.alpha - flagsForEnemy.firstFlag.alpha)));
                    let da2 = Math.sqrt(Math.pow(flagsForEnemy.thirdFlag.distance, 2) +
                        Math.pow(flagsForEnemy.firstFlag.distance, 2) -
                        2 * flagsForEnemy.firstFlag.distance * flagsForEnemy.thirdFlag.distance *
                        Math.cos(Math.PI / 180 * Math.abs(flagsForEnemy.thirdFlag.alpha - flagsForEnemy.firstFlag.alpha)));
                    if (this.print) {
                        let save = this.enemy_coors;
                        this.enemy_coors = this.calculatePosition(this.coords.x, this.coords.y,
                            Flags[secondFlag].x, Flags[secondFlag].y,
                            Flags[thirdFlag].x, Flags[thirdFlag].y,
                            flagsForEnemy.firstFlag.distance,
                            da1,
                            da2, false);
                        if (this.enemy_coors === undefined) {
                            this.enemy_coors = save;
                        }
                    }
                }
            } catch (err) {
                // console.error("undefined coors");
            }
            let sensorData = Msg.parseSeeMsg(msg);
            if (this.run && this.decideTree) {
                this.act = getAction(this.decideTree, sensorData)
                // console.log(this.act)
                this.sensorData = null
                if (this.act === true) {
                    this.decideTree = null
                    this.sensorData = sensorData
                    this.act = null
                }
            } else {
                if (!this.decideTree) {
                    this.sensorData = sensorData
                }
            }
        }
    } // Анализ сообщения
    getSensorData() {
        return this.sensorData
    }

    setAct(act) {
        this.act = act;
    }

    setTree(tree) {
        this.decideTree = tree
    }

    getRun() {
        return this.run
    }

    sendCmd() {
        if (this.run && this.act) {
            this.socketSend(this.act.n, this.act.v)
            this.act = null
        //     if (this.act) {
        //         if (this.act.n == "kick") {
        //             // Если значение команды kick уже задано как строка с параметрами, отправляем его напрямую
        //             if (typeof this.act.v === "string" && this.act.v.includes(" ")) {
        //                 this.socketSend("kick", this.act.v);
        //             } else {
        //                 this.socketSend("kick", this.act.v + " 0");
        //             }
        //         } else {
        //             this.socketSend(this.act.n, this.act.v);
        //         }
        //     }
        //     this.act = null;
        }
    }
}
module.exports = Agent // Экспорт игрока