const MessageProcessor = require('./message-processor');

const getAction = require('./action.js');

const goalieTree = require('./goalie.js')

/**
 * Класс контроллера для управления агентом
 */
class Controller {
    /**
     * Создает экземпляр контроллера
     * @param {Array} actions - массив действий для выполнения
     * @param {Object} agent - ссылка на агента
     */
    constructor(actions, agent) {
        this.actions = actions;
        this.currentActionIndex = 0;
        this.agent = agent;
        this.messageProcessor = new MessageProcessor(agent);
    }

    /**
     * Обрабатывает полученное сообщение
     * @param {string} msg - сообщение от сервера
     * @returns {Object} - разобранное сообщение
     */
    processMessage(msg) {
        return this.messageProcessor.processMsg(msg);
    }

    /**
     * Формирует команду на основе данных сенсоров
     * @param {Array} sensorData - данные сенсоров
     * @returns {Object|null} - команда для выполнения
     */
    update(sensorData) {
        return getAction(goalieTree, sensorData)
    }

    /**
     * Обрабатывает действие типа "flag"
     * @param {Object} action - текущее действие
     * @param {Array} sensorData - данные сенсоров
     * @returns {Object} - команда для выполнения
     */
    handleFlagAction(action, sensorData) {
        let target = sensorData.find(item => item.key === action.fl);
        if (!target) {
            return { cmd: "turn", value: 20 };
        } else {
            if (target.distance < 3) {
                this.currentActionIndex = (this.currentActionIndex + 1) % this.actions.length;
                return { cmd: "dash", value: 0 };
            } else {
                if (Math.abs(target.alpha) > 5) {
                    return { cmd: "turn", value: target.alpha };
                } else {
                    return { cmd: "dash", value: 70 };
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
    handleKickAction(action, sensorData) {
        let ball = sensorData.find(item => item.key === action.fl);
        if (!ball) {
            return { cmd: "turn", value: 20 };
        } else {
            if (ball.distance > 0.5) {
                if (Math.abs(ball.alpha) > 5) {
                    return { cmd: "turn", value: ball.alpha };
                } else {
                    return { cmd: "dash", value: 70 };
                }
            } else {
                // Мяч в зоне удара
                // Проверяем, видны ли ворота (цель удара)
                let goal = sensorData.find(item => item.key === action.goal);
                if (goal) {
                    // Если ворота видны – сильный удар по направлению ворот
                    return { cmd: "kick", value: `100 ${goal.alpha}` };
                } else {
                    // Если ворота не видны – слабый удар, чтобы мяч откатился (например, 45° вправо)
                    return { cmd: "kick", value: "5 30" };
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
