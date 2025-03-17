const Msg = require('./msg');
const PositionUtils = require('./position-utils');
const Flags = require('./flags');
const manager = require('./manager_automation.js');

/**
 * Класс для обработки сообщений от сервера
 */
class MessageProcessor {
    /**
     * Создает экземпляр обработчика сообщений
     * @param {Object} agent - ссылка на агента для обновления его состояния
     */
    constructor(agent) {
        this.agent = agent;
        this.inputDto = require('./inputDto.js')
        this.authomat = require('./automaton.js');
    }

    /**
     * Обрабатывает полученное сообщение
     * @param {string} msg - сообщение от сервера
     * @returns {Object} - разобранное сообщение
     */
    processMsg(msg) {
        let data = Msg.parseMsg(msg);
        if (!data) throw new Error("Parse error\n" + msg);

        // Обработка различных типов сообщений
        if (data.cmd == "hear") {
            this.processHearMsg(data);
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
        this.agent.run = true;
        if (data.msg.includes("goal")) {
            if (this.agent.controller) {
                this.agent.controller.reset();
            }
        }
    }

    /**
     * Обрабатывает сообщение типа "init"
     * @param {Array} p - параметры сообщения
     */
    processInitMsg(p) {
        if (p[0] == "r") this.agent.position = "r"; // Правая половина поля
        if (p[1]) this.agent.id = p[1]; // id игрока
    }

    /**
     * Обрабатывает сообщение типа "see"
     * @param {string} msg - содержимое сообщения
     */
    processSeeMsg(msg) {
        try {
            let distances = Msg.parseSeeMsg(msg);
            this.updateAgentPosition(distances);
            this.updateEnemyPosition(distances);
            this.updateControllerCommand(distances);
        } catch (err) {
            // console.error("undefined coors");
        }
    }

    /**
     * Обновляет позицию агента на основе видимых флагов
     * @param {Array} distances - массив с информацией о видимых объектах
     */
    updateAgentPosition(distances) {
        let flagsForDistance = PositionUtils.chooseFlags(distances);
        let firstFlag = flagsForDistance.firstFlag.key;
        let secondFlag = flagsForDistance.secondFlag.key;
        let thirdFlag = flagsForDistance.thirdFlag.key;
        let oldCoords = this.agent.coords;

        this.agent.coords = PositionUtils.calculatePosition(
            Flags[firstFlag].x, Flags[firstFlag].y,
            Flags[secondFlag].x, Flags[secondFlag].y,
            Flags[thirdFlag].x, Flags[thirdFlag].y,
            flagsForDistance.firstFlag.distance,
            flagsForDistance.secondFlag.distance,
            flagsForDistance.thirdFlag.distance,
            false,
            oldCoords
        );

        if (this.agent.coords === undefined) {
            this.agent.coords = oldCoords;
        }

        this.inputDto.pos = this.agent.coords
    }

    /**
     * Обновляет позицию противника на основе видимых флагов
     * @param {Array} distances - массив с информацией о видимых объектах
     */
    updateEnemyPosition(distances) {
        let flagsForEnemy = PositionUtils.chooseFlagsForEnemy(distances);
        if (flagsForEnemy) {
            let secondFlag = flagsForEnemy.secondFlag.key;
            let thirdFlag = flagsForEnemy.thirdFlag.key;
            let enemy_coords = []
            for (let el of flagsForEnemy.players) {
                flagsForEnemy.firstFlag = el
                let da1 = Math.sqrt(Math.pow(flagsForEnemy.secondFlag.distance, 2) +
                    Math.pow(flagsForEnemy.firstFlag.distance, 2) -
                    2 * flagsForEnemy.firstFlag.distance * flagsForEnemy.secondFlag.distance *
                    Math.cos(Math.PI / 180 * Math.abs(flagsForEnemy.secondFlag.alpha - flagsForEnemy.firstFlag.alpha)));
                let da2 = Math.sqrt(Math.pow(flagsForEnemy.thirdFlag.distance, 2) +
                    Math.pow(flagsForEnemy.firstFlag.distance, 2) -
                    2 * flagsForEnemy.firstFlag.distance * flagsForEnemy.thirdFlag.distance *
                    Math.cos(Math.PI / 180 * Math.abs(flagsForEnemy.thirdFlag.alpha - flagsForEnemy.firstFlag.alpha)));
                if (this.print) {
                    let coords = this.calculatePosition(this.coords.x, this.coords.y,
                        Flags[secondFlag].x, Flags[secondFlag].y,
                        Flags[thirdFlag].x, Flags[thirdFlag].y,
                        flagsForEnemy.firstFlag.distance,
                        da1,
                        da2, false);
                    if (coords) {
                        let ball = null
                        if (flagsForEnemy.firstFlag.key === "b") {
                            ball = {
                                x: coords.x,
                                y: coords.y,
                                dist: flagsForEnemy.firstFlag.distance,
                                angle: flagsForEnemy.firstFlag.alpha,
                                f: flagsForEnemy.firstFlag.key
                            }
                            this.inputDto.ballPrev = this.inputDto.ball
                            this.inputDto.ball = ball
                        } else {
                            enemy_coords.push({
                                x: coords.x,
                                y: coords.y,
                                dist: flagsForEnemy.firstFlag.distance,
                                angle: flagsForEnemy.firstFlag.alpha,
                                f: flagsForEnemy.firstFlag.key
                            })
                        }
                    }
                }
            }
            this.inputDto.team = enemy_coords
        }
    }

    /**
     * Обновляет команду контроллера на основе видимых объектов
     * @param {Array} distances - массив с информацией о видимых объектах
     */
    updateControllerCommand(distances) {
       this.agent.act = manager.getAction(this.inputDto, this.authomat, 'few', 'l')
    }
}

module.exports = MessageProcessor; 