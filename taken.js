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
        if (!input) return null;

        return {
            time: input.time || 0,
            pos: {
                x: input.pos?.x || 0,
                y: input.pos?.y || 0
            },
            ball: {
                x: input.ball?.x || 0,
                y: input.ball?.y || 0,
                z: input.ball?.z || 0,
                dist: input.ball?.dist || 0,
                angle: input.ball?.angle || 0
            },
            teamOwn: input.teamOwn || [],
            teamA: input.teamA?.map(player => ({
                x: player.x,
                y: player.y,
                z: player.z,
                dist: player.dist,
                angle: player.angle
            })) || [],
            goal: {
                x: input.goal?.x || 0,
                y: input.goal?.y || 0,
                z: input.goal?.z || 0,
                dist: input.goal?.dist || 0,
                angle: input.goal?.angle || 0
            }
        };
    }
}

module.exports = Taken; 