const FL = "flag"
module.exports = {
    state: {
        isCatch: false,
        print: false,
        next: 0,
        action: null,
        sequence: [{act: FL, fl: "gr", move: true}, {act: FL, fl: "b", move: false}],
        command: null
    },
    root: {
        exec(mgr, state) {
            state.command = null;
            state.action = state.sequence[state.next];
        },
        next: "isVisibleFlag"
    },
    isVisibleFlag: {
        condition: (mgr, state) => mgr.getVisible(state.action.fl),
        trueCond: "isMoveToFlag",
        falseCond: "rotate",
    },
    isMoveToFlag: {
        condition: (mgr, state) => state.action.move,
        trueCond: "isMoveToGr",
        falseCond: "isRotateToBall",
    },
    isRotateToBall : {
        condition: (mgr, state) => Math.abs(mgr.getAngle(state.action.fl)) > 5,
        trueCond: "rotateToFlag",
        falseCond: "isVerySmallDistanceBall",
    },
    isVerySmallDistanceBall: {
        condition: (mgr, state) => mgr.getDistance(state.action.fl) < 2 && state.isCatch,
        trueCond: "catchBall",
        falseCond: "isCatch",
    },
    isCatch : {
        condition: (mgr, state) => state.isCatch,
        trueCond: "kickBall",
        falseCond: "isSmallDistanceBall",
    },
    isSmallDistanceBall: {
        condition: (mgr, state) => mgr.getDistance(state.action.fl) < 7,
        trueCond: "moveToBall",
        falseCond: "kickBall",
    },
    moveToBall : {
        exec(mgr, state) {
            state.action.move = true
        }, next: "isVisibleFlag",
    },
    catchBall : {
        exec(mgr, state) {
            state.command = {n: "catch", v: mgr.getAngle(state.action.fl)};
            state.isCatch = true
        }, next: "sendCommand",
    },
    kickBall: {
        exec(mgr, state) {
            state.isCatch = false
            console.log(mgr.getDistance(state.action.fl))
            state.command = {n: "kick", v: `100 ${mgr.getAngle(state.action.fl)}`}
        }, next: "sendCommand",
    },
    isMoveToGr: {
        condition: (mgr, state) => mgr.getDistance(state.action.fl) > 5,
        trueCond: "moveToGr",
        falseCond: "changeState",
    },
    changeState: {
        exec(mgr, state) {
            if (state.next !== state.sequence.length - 1) {
                state.next++;
            }
            state.action = state.sequence[state.next];
        }, next: "root"
    },
    rotate: {
        exec(mgr, state) {
            state.command = {n: "turn", v: 30};
        }, next: "sendCommand",
    },
    moveToGr: {
        condition: (mgr, state) => Math.abs(mgr.getAngle(state.action.fl)) > 5,
        trueCond: "rotateToFlag",
        falseCond: "dashToGr",
    },
    dashToGr: {
        exec(mgr, state) {
            state.command = {n: "dash", v: "80"};
        }, next: "sendCommand",
    },
    rotateToFlag: {
        exec(mgr, state) {
            state.command = {n: "turn", v: mgr.getAngle(state.action.fl)};
        }, next: "sendCommand",
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
}