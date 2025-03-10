const FL = "flag"
module.exports = {
    state: {
        print : false,
        next: 0,
        value : 0,
        sequence: [{act: FL, fl: "^p.*Supercomputer.*"}],
        command: null
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next];
            console.log(state.sequence[state.next], "Я тут");
            state.command = null
        },
        next: "isSmallDistance"
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
    isSmallDistance: {
        condition: (mgr, state) => {return !mgr.getVisible(state.action.fl) || mgr.getDistance(state.action.fl) < 3 && Math.abs(mgr.getAngle(state.action.fl) < 40) || mgr.getVisible("^p.*Supercomputer.*")  && mgr.getDistance("^p.*Supercomputer.*") < 3 && Math.abs(mgr.getAngle("^p.*Supercomputer.*") < 40) },
        trueCond: "rotate30",
        falseCond: "isBigDistance",
    },
    isBigDistance: {
        condition: (mgr, state) => mgr.getDistance(state.action.fl) && mgr.getDistance(state.action.fl) > 10,
        trueCond: "isBigAngle",
        falseCond: "isAngleBetween",
    },
    isBigAngle : {
        condition: (mgr, state) => {
            state.value =  mgr.getAngle(state.action.fl);
            if (state.value === undefined) {
                state.value = 30;
                return true;
            }
            return Math.abs(mgr.getAngle(state.action.fl)) > 5
        },
        trueCond: "rotateAngle",
        falseCond: "dash",
    },
    rotateAngle: {
        exec(mgr, state) {
            state.command = {n: "turn", v: state.value};
        }, next: "sendCommand",
    },
    dash : {
        exec(mgr, state) {
            state.command = {n: "dash", v: 80};
        }, next: "sendCommand",
    },
    rotate30: {
        exec(mgr, state) {
            state.command = {n: "turn", v: "30"}
        }, next: "sendCommand",
    },
    isAngleBetween: {
        condition: (mgr, state) => {state.value = mgr.getAngle(state.action.fl) - 30; return mgr.getAngle(state.action.fl) < 25 && mgr.getAngle(state.action.fl) > 40},
        trueCond: "rotateAngle",
        falseCond: "isSmallDistance2",
    },
    isSmallDistance2: {
        condition: (mgr, state) => mgr.getDistance(state.action.fl) < 15,
        trueCond: "dash20",
        falseCond: "dash40",
    },
    dash20: {
        exec(mgr, state) {
            state.command = {n: "dash", v: "20"}
        }, next: "sendCommand",
    },
    dash40: {
        exec(mgr, state) {
            state.command = {n: "dash", v: "40"}
        }, next: "sendCommand",
    },
}