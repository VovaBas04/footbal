class Manager{
    constructor(sensorData) {
        this.sensorData = sensorData;
    }

    getElement(flag) {
        if (flag[0] === '^') {
            const pattern = new RegExp(flag)

            return this.sensorData.find(elem => pattern.test(elem.key));
        }
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
}

module.exports = Manager;