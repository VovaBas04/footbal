const FL = "flag"
module.exports = {
    state: {
        isCatch: false,
        print: true,
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
        condition: (mgr, state) => mgr.getVisible(state.action.fl) || state.isCatch,
        trueCond: "isCatch",
        falseCond: "rotate",
    },
    isCatch : {
        condition: (mgr, state) => state.isCatch,
        trueCond: "kickBall",
        falseCond: "isMoveToFlag",
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
        condition: (mgr, state) => {console.log(mgr.getDistance(state.action.fl), "dist"); return  mgr.getDistance(state.action.fl) < 2},
        trueCond: "catchBall",
        falseCond: "isSmallDistanceBall",
    },
    isSmallDistanceBall: {
        condition: (mgr, state) => mgr.getDistance(state.action.fl) < 20,
        trueCond: "moveToBall",
        falseCond: "kickBall",
    },
    moveToBall : {
        exec(mgr, state) {
            state.sequence[state.next].move = true
        }, next: "isVisibleFlag",
    },
    catchBall : {
        exec(mgr, state) {
            state.command = {n: "catch", v: mgr.getAngle(state.action.fl)};
            state.isCatch = true
            state.sequence[state.next].move = false
        }, next: "sendCommand",
    },
    kickBall: {
        exec(mgr, state) {
            if (state.isCatch) {
                state.next--
                state.isCatch = false
            }
            console.log(state.isCatch)
            state.command = {n: "kick", v: `100 ${mgr.getAngle(state.action.fl)}`}
        }, next: "sendCommand",
    },
    isMoveToGr: {
        condition: (mgr, state) => mgr.getDistance(state.action.fl) > 2,
        trueCond: "moveToGr",
        falseCond: "isChangeState",
    },
    isChangeState: {
        condition: (mgr, state) => state.next !== state.sequence.length - 1,
        trueCond: "changeState",
        falseCond: "disableMove",
    },
    disableMove : {
        exec(mgr, state) {
            state.sequence[state.next].move = false
        }, next: "sendCommand",
    },
    changeState: {
        exec(mgr, state) {
            state.next++
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