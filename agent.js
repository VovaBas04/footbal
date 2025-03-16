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
        this.controller = null; // Контроллер будет установлен позже
        this.run = false // Игра начата
        this.act = null // Действия
        this.r1 = readline.createInterface({ // Чтение консоли
            input: process.stdin,
            output: process.stdout
        })
        this.r1.on('line', (input) => { // Обработка строки из консоли
            if (this.controller && this.controller.run) { // Если игра начата
                // Движения вперед, вправо, влево, удар по мячу
                if("w" == input) this.controller.setAction("dash", 100);
                if("d" == input) this.controller.setAction("turn", 20);
                if("a" == input) this.controller.setAction("turn", -20);
                if("s" == input) this.controller.setAction("kick", 100);
            }
        })
    }

    /**
     * Обрабатывает полученное сообщение
     * @param {Buffer} msg - сообщение от сервера
     */
    msgGot(msg) {
        let data = msg.toString('utf8') // Приведение к строке
        
        // Если контроллер установлен, используем его для обработки сообщений
        if (this.controller) {
            this.controller.processMessage(data);
        }
        
        this.sendCmd() // Отправка команды
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
        if (this.controller) {
            const action = this.controller.getCurrentAction();
            if (action) {
                this.socketSend(action.n, action.v);
                this.controller.clearAction();
            }
        }
    }
}

module.exports = Agent // Экспорт игрока