class Controller {
    constructor(actions, agent) {
        this.actions = actions;
        this.currentActionIndex = 0;
        this.agent = agent;
    }

    update(sensorData) {
        let currentAction = this.actions[this.currentActionIndex];
        if (!currentAction) return null;

        if (currentAction.act === "flag") {
            let target = sensorData.find(item => item.key === currentAction.fl);
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
        } else if (currentAction.act === "kick") {
            let ball = sensorData.find(item => item.key === currentAction.fl);
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
                    let goal = sensorData.find(item => item.key === currentAction.goal);
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
        return null;
    }

    reset() {
        this.currentActionIndex = 0;
    }
}

module.exports = Controller;
