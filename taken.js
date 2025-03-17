class Taken {
    constructor() {
        this.time = 0;
        this.pos = { x: 0, y: 0 };
        this.hear = [];
        this.ball = { x: 0, y: 0, z: 0, dist: 0, angle: 0 };
        this.teamOwn = [];
        this.teamA = [];
        this.goal = { x: 0, y: 0, z: 0, dist: 0, angle: 0 };
    }

    static setHear(input) {
        if (!input || !input.hear) return;
        
        this.hear = input.hear.map(h => ({
            time: h.time,
            who: h.who,
            msg: h.msg
        }));
    }

    static getSee(input, team, side) {
        return input
    }
}

module.exports = Taken; 