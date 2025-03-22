class Manager{
    constructor(sensorData, print = false) {
        this.sensorData = sensorData;
    }

    getElement(flag) {
        if (flag[0] === '^') {
            const pattern = new RegExp(flag)

            return this.sensorData.find(elem => pattern.test(elem.key));
        }
        if(flag.includes('p"')) return this.sensorData.find(elem => elem.key.includes(flag))
        return this.sensorData.find(elem => elem.key === flag);
    }

    getVisible(flag) {
        if (flag[0] === '^') {
            const pattern = new RegExp(flag)

            return this.sensorData.find(elem => pattern.test(elem.key));
        }
        return this.getElement(flag) !== undefined
    }

    getDistance(flag) {
        let elem = this.getElement(flag)
        if (elem) {
            return elem.distance
        }
        return undefined
    }

    getAngle(flag) {
        let elem = this.getElement(flag)
        if (elem) {
            return elem.alpha
        }
        return undefined
    }

    isPlayOn(p, prev) {
        console.log(p, prev)
        if (prev){
            if (p.message.includes("goal")){
                return false;
            }
            return true;
        }
        if (p.message === "play_on"){
            return true;
        }
        return false;
    }

    hearGo(p) {
        if (!p) return false;
        return p.message === '"go"';
    }

    getStrength(distance) {
        // Рассчитываем силу удара в зависимости от расстояния
        if (distance < 10) return 30;
        if (distance < 20) return 50;
        if (distance < 30) return 70;
        return 100;
    }
}

module.exports = Manager;