const Msg = require('./msg');
const PositionUtils = require('./position-utils');
const Flags = require('./flags');

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
    }

    /**
     * Обновляет позицию противника на основе видимых флагов
     * @param {Array} distances - массив с информацией о видимых объектах
     */
    updateEnemyPosition(distances) {
        let flagsForEnemy = PositionUtils.chooseFlagsForEnemy(distances);
        if (flagsForEnemy && this.agent.print) {
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
            
            let save = this.agent.enemy_coors;
            this.agent.enemy_coors = PositionUtils.calculatePosition(
                this.agent.coords.x, this.agent.coords.y,
                Flags[secondFlag].x, Flags[secondFlag].y,
                Flags[thirdFlag].x, Flags[thirdFlag].y,
                flagsForEnemy.firstFlag.distance,
                da1,
                da2,
                false,
                save
            );
            
            if (this.agent.enemy_coors === undefined) {
                this.agent.enemy_coors = save;
            }
        }
    }

    /**
     * Обновляет команду контроллера на основе видимых объектов
     * @param {Array} distances - массив с информацией о видимых объектах
     */
    updateControllerCommand(distances) {
        if (this.agent.controller) {
            let controlCommand = this.agent.controller.update(distances);
            if (controlCommand) {
                if (controlCommand.cmd === "dash") {
                    this.agent.act = { n: "dash", v: controlCommand.value };
                } else if (controlCommand.cmd === "turn") {
                    this.agent.act = { n: "turn", v: controlCommand.value };
                } else if (controlCommand.cmd === "kick") {
                    this.agent.act = { n: "kick", v: controlCommand.value };
                }
            }
        }
    }
}

module.exports = MessageProcessor; 