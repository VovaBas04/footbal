const Msg = require('./msg')
const Flags = require('./flags')
const readline = require('readline')

/**
 * Класс агента, представляющего игрока на поле
 */
class Agent {
    /**
     * Создает экземпляр агента
     * @param {boolean} print - флаг для вывода отладочной информации
     */
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

    /**
     * Обрабатывает полученное сообщение
     * @param {Buffer} msg - сообщение от сервера
     */
    msgGot(msg) {
        let data = msg.toString('utf8') // Приведение с строке
        
        // Если контроллер установлен, используем его для обработки сообщений
        if (this.controller) {
            this.controller.processMessage(data);
        }
        
        this.sendCmd() // Отправка команды к строке
    }

    /**
     * Устанавливает сокет для отправки сообщений
     * @param {Object} socket - сокет для отправки сообщений
     */
    setSocket(socket) {
        this.socket = socket
    }

    /**
     * Отправляет команду на сервер
     * @param {string} cmd - команда
     * @param {string|number} value - значение команды
     */
    socketSend(cmd, value) {
        this.socket.sendMsg(`(${cmd} ${value})`)
    }

    /**
     * Отправляет команду на сервер
     */
    sendCmd() {
        if (this.run) {
            if (this.act) {
                this.socketSend(this.act.n, this.act.v);
            }
            this.act = null;
        }
    }
}

module.exports = Agent // Экспорт игрока