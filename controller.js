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
     * @param {Array} actions - массив действий для выполнения
     * @param {boolean} print - флаг для вывода отладочной информации
     * @param dt
     */
    constructor(actions, print = false, dt = null) {
        this.actions = actions;
        this.currentActionIndex = 0;
        this.sensorData = null;
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
        this.run = true;
        console.log("Heard" + data.msg)
        if (data.msg.includes("goal")) {
            this.reset();
        }
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
            this.updateControllerCommand();
        } catch (err) {
            // console.error("undefined coors");
        }
    }

    /**
     * Обновляет позицию агента на основе видимых флагов
     * @param {Array} sensorData - массив с информацией о видимых объектах
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
     * @param {Array} sensorData - массив с информацией о видимых объектах
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
     * @param {Array} sensorData - массив с информацией о видимых объектах
     */
    updateControllerCommand() {
        let controlCommand = this.update();
        if (controlCommand) {
            this.act = controlCommand;
        }
    }

    /**
     * Формирует команду на основе данных сенсоров
     * @param {Array} sensorData - данные сенсоров
     * @returns {Object|null} - команда для выполнения
     */
    update() {
        if (this.run) {
            if(this.dt){
                return getAction(this.dt, this.sensorData)
            } else {
                let currentAction = this.actions[this.currentActionIndex];
                if (!currentAction) return null;

                if (currentAction.act === "flag") {
                    return this.handleFlagAction(currentAction);
                } else if (currentAction.act === "kick") {
                    return this.handleKickAction(currentAction);
                }
            }
        }
        return null
    }

    /**
     * Обрабатывает действие типа "flag"
     * @param {Object} action - текущее действие
     * @param {Array} sensorData - данные сенсоров
     * @returns {Object} - команда для выполнения
     */
    handleFlagAction(action) {
        let target = this.sensorData.find(item => item.key === action.fl);
        if (!target) {
            return { n: "turn", v: 20 };
        } else {
            if (target.distance < 3) {
                this.currentActionIndex = (this.currentActionIndex + 1) % this.actions.length;
                return { n: "dash", v: 0 };
            } else {
                if (Math.abs(target.alpha) > 5) {
                    return { n: "turn", v: target.alpha };
                } else {
                    return { n: "dash", v: 70 };
                }
            }
        }
    }

    /**
     * Обрабатывает действие типа "kick"
     * @param {Object} action - текущее действие
     * @param {Array} sensorData - данные сенсоров
     * @returns {Object} - команда для выполнения
     */
    handleKickAction(action) {
        let ball = this.sensorData.find(item => item.key === action.fl);
        if (!ball) {
            return { n: "turn", v: 20 };
        } else {
            if (ball.distance > 0.5) {
                if (Math.abs(ball.alpha) > 5) {
                    return { n: "turn", v: ball.alpha };
                } else {
                    return { n: "dash", v: 70 };
                }
            } else {
                // Мяч в зоне удара
                // Проверяем, видны ли ворота (цель удара)
                let goal = this.sensorData.find(item => item.key === action.goal);
                if (goal) {
                    // Если ворота видны – сильный удар по направлению ворот
                    return { n: "kick", v: `100 ${goal.alpha}` };
                } else {
                    // Если ворота не видны – слабый удар, чтобы мяч откатился (например, 45° вправо)
                    return { n: "kick", v: "5 30" };
                }
            }
        }
    }

    /**
     * Сбрасывает индекс текущего действия
     */
    reset() {
        this.currentActionIndex = 0;
    }
}

module.exports = Controller;
