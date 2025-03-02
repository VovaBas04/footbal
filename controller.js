const Flags = require('./flags');

class Controller {
    constructor(actions, agent) {
        this.actions = actions;
        this.currentActionIndex = 0;
        this.agent = agent;
    }

    /**
     * Анализирует данные, полученные из сообщения "see"
     * и возвращает объект с командой для отправки серверу.
     * sensorData – массив объектов вида { key, distance, alpha }
     */
    update(sensorData) {
        let currentAction = this.actions[this.currentActionIndex];
        if (!currentAction) return null;

        if (currentAction.act === "flag") {
            // Поиск нужного флага среди видимых объектов
            let target = sensorData.find(item => item.key === currentAction.fl);
            if (!target) {
                // Флаг не виден – повернуться, чтобы найти его
                return { cmd: "turn", value: 20 };
            } else {
                if (target.distance < 3) {
                    // Флаг достигнут – переходим к следующему действию
                    this.currentActionIndex = (this.currentActionIndex + 1) % this.actions.length;
                    // Можно отправить команду, чтобы остановиться (или повторить обновление)
                    return { cmd: "dash", value: 0 };
                } else {
                    // Флаг виден, но ещё далеко
                    if (Math.abs(target.alpha) > 5) {
                        // Повернуть в сторону флага
                        return { cmd: "turn", value: target.alpha };
                    } else {
                        // Двигаться вперёд
                        return { cmd: "dash", value: 50 };
                    }
                }
            }
        } else if (currentAction.act === "kick") {
            // Для удара – ищем мяч (обозначенный как "b")
            let ball = sensorData.find(item => item.key === currentAction.fl);
            if (!ball) {
                // Мяч не виден – повернуться в поисках мяча
                return { cmd: "turn", value: 20 };
            } else {
                if (ball.distance > 0.5) {
                    // Если мяч виден, но далеко, двигаться к нему (аналогично движению к флагу)
                    if (Math.abs(ball.alpha) > 5) {
                        return { cmd: "turn", value: ball.alpha };
                    } else {
                        return { cmd: "dash", value: 30 };
                    }
                } else {
                    // Мяч в зоне удара
                    // Проверяем, видны ли ворота (цель удара)
                    let goal = sensorData.find(item => item.key === currentAction.goal);
                    if (goal) {
                        // Если ворота видны – сильный удар по направлению ворот
                        return { cmd: "kick", value: "100 0" };
                    } else {
                        // Если ворота не видны – слабый удар, чтобы мяч откатился (например, 45° вправо)
                        return { cmd: "kick", value: "10 45" };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Сброс последовательности действий (например, после забитого гола)
     */
    reset() {
        this.currentActionIndex = 0;
    }
}

module.exports = Controller;
