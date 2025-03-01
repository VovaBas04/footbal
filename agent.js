const Msg = require('./msg')
let  flag = true

const Flags = {
    ftl50: {x: -50, y: -39}, ftl40: {x: -40, y: -39},
    ftl30: {x: -30, y: -39}, ftl20: {x: -20, y: -39},
    ftl10: {x: -10, y: -39}, flO: {x: 0, y: -39},
    ftr10: {x: 10, y: -39}, ftr20: {x: 20, y: -39},
    ftr30: {x: 30, y: -39}, ftr40: {x: 40, y: -39},
    ftr50: {x: 50, y: -39}, fbl50: {x: -50, y: 39},
    fbl40: {x: -40, y: 39}, fbl30: {x: -30, y: 39},
    fbl20: {x: -20, y: 39}, fbl10: {x: -10, y: 39},
    fb0: {x: 0, y: 39}, fbr10: {x: 10, y: 39},
    fbr20: {x: 20, y: 39}, fbr30: {x: 30, y: 39},
    fbr40: {x: 40, y: 39}, fbr50: {x: 50, y: 39},
    flt30: {x: -57.5, y: -30}, flt20: {x: -57.5, y: -20},
    flt10: {x: -57.5, y: -10}, fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: 10}, flb20: {x: -57.5, y: 20},
    flb30: {x: -57.5, y: 30}, frt30: {x: 57.5, y: -30},
    frt20: {x: 57.5, y: -20}, frt10: {x: 57.5, y: -10},
    frO: {x: 57.5, y: 0}, frb10: {x: 57.5, y: 10},
    frb20: {x: 57.5, y: 20}, frb30: {x: 57.5, y: 30},
    fglt: {x: -52.5, y: -7.01}, fglb: {x: -52.5, y: 7.01},
    gl: {x: -52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: -20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y: 20.15}, fgrt: {x: 52.5, y: -7.01},
    fgrb: {x: 52.5, y: 7.01}, fprt: {x: 36, y: -20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y: 20.15},
    flt: {x: -52.5, y: -34}, fct: {x: 0, y: -34},
    frt: {x: 52.5, y: -34}, flb: {x: -52.5, y: 34},
    fcb: {x: 0, y: 34}, frb: {x: 52.5, y: 34}
}

// Подключение модуля разбора сообщений от сервера
const readline = require('readline')
let i = false;
// Подключение модуля ввода из командной строки
class Agent {
    constructor(print = false) {
        this.print = print
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
    processMsg(msg) { // Обработка сообщения
        let data = Msg.parseMsg(msg) // Разбора сообщения
        if (!data) throw new Error("Parse error\n" + msg)
        i = false
        // Первое (hear) - начало игры
        if (data.cmd == "hear") this.run = true
        if (data.cmd == "init") this.initAgent(data.p) // Иницализация
        // if (data.cmd == "see") {
            // flag = false
        // }
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }
    initAgent(p) {
        if(p[0] == "r") this.position = "r" // Правая половина поля
        if(p[1]) this.id = p[1] // id игрока
    }
    calculatePosition(x1, y1, x2, y2, x3, y3, d1, d2, d3, flag = false) {
        if (flag) {
            console.log("coors", x1, y1, x2, y2, x3, y3, d1, d2, d3)
        }
        // let alpha1 = (y1 - y2) / (x2 - x1)
        // let beta1 = (y2 * y2 - y1 * y1 + x2 * x2 - x1 * x1 + d1 * d1 - d2 * d2) / (2 * (x2 - x1))
        // let alpha2 = (y1 - y3) / (x3 - x1)
        // let beta2 = (y3 * y3 - y1 * y1 + x3 * x3 - x1 * x1 + d1 * d1 - d3 * d3) / (2 * (x3 - x1))
        // let y = (beta1 - beta2) / (alpha2 - alpha1)
        // let x = alpha1 * (beta1 - beta2) / (alpha2 - alpha1) + beta1
        // return {x : x, y : y}
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
        if (flag) {
            console.log("coefs", a, b, c)
        }
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
                if (flag) {
                    console.log("x y", x, y_ans_1, y_ans_2, "err", error)
                }
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
    analyzeEnv(msg, cmd, p) {
        if (cmd === "see") {
            try {

                let distances = Msg.parseSeeMsg(msg)
                let flagsForDistance = this.chooseFlags(distances)
                let firstFlag = flagsForDistance.firstFlag.key
                let secondFlag = flagsForDistance.secondFlag.key
                let thirdFlag = flagsForDistance.thirdFlag.key
                let oldCoords = this.coords
                this.coords = this.calculatePosition(Flags[firstFlag].x, Flags[firstFlag].y, Flags[secondFlag].x, Flags[secondFlag].y, Flags[thirdFlag].x, Flags[thirdFlag].y, flagsForDistance.firstFlag.distance, flagsForDistance.secondFlag.distance, flagsForDistance.thirdFlag.distance)
                if (this.coords === undefined) {
                    this.coords = oldCoords
                }
                if (this.print) {
                    console.log("my coors", this.coords)
                }
                let flagsForEnemy = this.chooseFlagsForEnemy(distances)
                if (flagsForEnemy) {
                    let secondFlag = flagsForEnemy.secondFlag.key
                    let thirdFlag = flagsForEnemy.thirdFlag.key
                    let da1 = Math.sqrt(Math.pow(flagsForEnemy.secondFlag.distance, 2) + Math.pow(flagsForEnemy.firstFlag.distance, 2) - 2 * flagsForEnemy.firstFlag.distance * flagsForEnemy.secondFlag.distance * Math.cos(Math.PI / 180 * Math.abs(flagsForEnemy.secondFlag.alpha - flagsForEnemy.firstFlag.alpha)))
                    let da2 = Math.sqrt(Math.pow(flagsForEnemy.thirdFlag.distance, 2) + Math.pow(flagsForEnemy.firstFlag.distance, 2) - 2 * flagsForEnemy.firstFlag.distance * flagsForEnemy.thirdFlag.distance * Math.cos(Math.PI / 180 * Math.abs(flagsForEnemy.thirdFlag.alpha - flagsForEnemy.firstFlag.alpha)))
                    if (this.print) {
                        let save = this.enemy_coors
                        this.enemy_coors = this.calculatePosition(this.coords.x, this.coords.y, Flags[secondFlag].x, Flags[secondFlag].y, Flags[thirdFlag].x, Flags[thirdFlag].y, flagsForEnemy.firstFlag.distance, da1, da2, false)
                        if (this.enemy_coors === undefined) {
                            this.enemy_coors = save
                        }
                        console.log("enemy coors: ", this.enemy_coors)
                    }
                }
            }
            catch (err) {
                console.error("undefined coors")
            }
        }
    } // Анализ сообщения
    sendCmd() {
        if (this.run) { // Игра начата
            if (this.act) { // Есть команда от игрока
                if (this.act.n == "kick") // Пнуть мяч
                    this.socketSend(this.act.n, thic.act.v + " 0")
                else // Движение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            this.act = null // Сброс команды
        }
    }
}
module.exports = Agent // Экспорт игрока