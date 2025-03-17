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
        if (this.agent.run) {
            return getAction(goalieTree, sensorData)
        }
        return null
    }
}

module.exports = Controller;
