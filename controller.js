const Msg = require('./msg');
const PositionUtils = require('./position-utils');
const Flags = require('./flags');

const getAction = require('./action.js');

/**
 * Класс контроллера для управления состоянием и действиями
 */
class Controller {
    /**
     * Создает экземпляр контроллера
     * @param {boolean} print - флаг для вывода отладочной информации
     * @param dt
     */
    constructor(print = false, dt = null) {
        this.sensorData = null;
        this.numb = 0
        this.position = "r"; // По умолчанию ~ левая половина поля
        this.run = false; // Игра начата
        this.act = null; // Действия
        this.coords = {x: 0, y: 0}; // Координаты
        this.enemy_coors = null; // Координаты противника
        this.print = print; // Флаг для вывода отладочной информации
        this.id = null; // id игрока
        this.dt = dt
    }

    /**
     * Получить текущее действие
     * @returns {Object|null} текущее действие
     */
    getCurrentAction() {
        return this.act;
    }

    /**
     * Сбросить текущее действие
     */
    clearAction() {
        this.act = null;
    }

    /**
     * Установить действие
     * @param {string} cmd - команда
     * @param {string|number} value - значение
     */
    setAction(cmd, value) {
        this.act = { n: cmd, v: value };
    }

    /**
     * Обрабатывает полученное сообщение
     * @param {string} msg - сообщение от сервера
     * @returns {Object} - разобранное сообщение
     */
    processMessage(msg) {
        let data = Msg.parseMsg(msg);
        if (!data) throw new Error("Parse error\n" + msg);

        // Обработка различных типов сообщений
        if (data.cmd == "hear") {
            this.processHearMsg(data.msg);
        } else if (data.cmd == "init") {
            this.processInitMsg(data.p);
        } else if (data.cmd == "see") {
            this.processSeeMsg(data.msg);
        }

        return data;
    }

    /**
     * Обрабатывает сообщение типа "hear"
     * @param {Object} data - разобранное сообщение
     */
    processHearMsg(data) {
        this.run = true;
        let heardMessage = Msg.parseHearMsg(data);
        // console.log(data)
        this.updateControllerCommand({
            action: heardMessage.action,
            time: heardMessage.time,
            source: heardMessage.source,
            message: heardMessage.message
        }, "hear");
    }

    /**
     * Обрабатывает сообщение типа "init"
     * @param {Array} p - параметры сообщения
     */
    processInitMsg(p) {
        if (p[0] == "r") this.position = "r"; // Правая половина поля
        if (p[1]) this.id = p[1]; // id игрока
    }

    /**
     * Обрабатывает сообщение типа "see"
     * @param {string} msg - содержимое сообщения
     */
    processSeeMsg(msg) {
        try {
            this.sensorData = Msg.parseSeeMsg(msg);
            this.updateAgentPosition();
            this.updateEnemyPosition();
            this.updateControllerCommand(this.sensorData, "see");
        } catch (err) {
            // console.error("undefined coors");
        }
    }

    /**
     * Обновляет позицию агента на основе видимых флагов
     */
    updateAgentPosition() {
        let flagsForDistance = PositionUtils.chooseFlags(this.sensorData);
        let firstFlag = flagsForDistance.firstFlag.key;
        let secondFlag = flagsForDistance.secondFlag.key;
        let thirdFlag = flagsForDistance.thirdFlag.key;
        let oldCoords = this.coords;
        
        this.coords = PositionUtils.calculatePosition(
            Flags[firstFlag].x, Flags[firstFlag].y,
            Flags[secondFlag].x, Flags[secondFlag].y,
            Flags[thirdFlag].x, Flags[thirdFlag].y,
            flagsForDistance.firstFlag.distance,
            flagsForDistance.secondFlag.distance,
            flagsForDistance.thirdFlag.distance,
            false,
            oldCoords
        );
        
        if (this.coords === undefined) {
            this.coords = oldCoords;
        }
    }

    /**
     * Обновляет позицию противника на основе видимых флагов
     */
    updateEnemyPosition() {
        let flagsForEnemy = PositionUtils.chooseFlagsForEnemy(this.sensorData);
        if (flagsForEnemy && this.print) {
            let secondFlag = flagsForEnemy.secondFlag.key;
            let thirdFlag = flagsForEnemy.thirdFlag.key;
            let da1 = Math.sqrt(
                Math.pow(flagsForEnemy.secondFlag.distance, 2) +
                Math.pow(flagsForEnemy.firstFlag.distance, 2) -
                2 * flagsForEnemy.firstFlag.distance * flagsForEnemy.secondFlag.distance *
                Math.cos(Math.PI / 180 * Math.abs(flagsForEnemy.secondFlag.alpha - flagsForEnemy.firstFlag.alpha))
            );
            let da2 = Math.sqrt(
                Math.pow(flagsForEnemy.thirdFlag.distance, 2) +
                Math.pow(flagsForEnemy.firstFlag.distance, 2) -
                2 * flagsForEnemy.firstFlag.distance * flagsForEnemy.thirdFlag.distance *
                Math.cos(Math.PI / 180 * Math.abs(flagsForEnemy.thirdFlag.alpha - flagsForEnemy.firstFlag.alpha))
            );
            
            let save = this.enemy_coors;
            this.enemy_coors = PositionUtils.calculatePosition(
                this.coords.x, this.coords.y,
                Flags[secondFlag].x, Flags[secondFlag].y,
                Flags[thirdFlag].x, Flags[thirdFlag].y,
                flagsForEnemy.firstFlag.distance,
                da1,
                da2,
                false,
                save
            );
            
            if (this.enemy_coors === undefined) {
                this.enemy_coors = save;
            }
        }
    }

    /**
     * Обновляет команду контроллера на основе видимых объектов
     */
    updateControllerCommand(sensorData, cmd) {
        // if(sensorData.find(elem => 'action' in elem)) console.log(sensorData)
        if (this.run) {
            if(this.dt){
                this.act = getAction(this.dt, sensorData, cmd, this.print);
                if (this.print) console.log("\n--------------------------\n");
                // console.log(this.act)
            }
            // if(this.numb === 0){
            //     this.act = {n: "say", v: "go"};
            //     this.numb = 1;
            //     console.log(this.numb)
            // }
            // else {
            //     this.act = null;
            // }
            return;
        }
        this.act = null;
    }
}

module.exports = Controller;
