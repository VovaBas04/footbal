const FL = "flag", KI = "kick"
const DecideTree = require('./mainTree.js');
let DecideTreeSupport = require('./supportTree.js');
module.exports = {
    state: {
        print : false,
        next: 0,
        ids : [],
        distances : [0, 0, 0],
        value : 0,
        sequence: [{act: FL, fl: "b"}, {act: FL, fl: "gl"}, {act: KI, fl: "b", goal: "gr"}],
        commands: []
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next];
            state.commands = []
        },
        next: "isVisibleAllTarget"
    },
    isVisibleAllTarget: {
        condition: (mgrs, state) => state.distances.filter(item => item).length === state.distances.length,
        trueCond: "getTree",
        falseCond: "rotate25"
    },
    sendCommands: {
        command: (mgr, state) => state.commands
    },
    rotate25: {
        exec(mgrs, state) {
            for (let i = 0; i < mgrs.length; i++) {
                if (!mgrs[i].getVisible(state.action.fl)) {
                    state.commands.push({n: "turn", v: "25"})
                } else {
                    state.distances[i] = mgrs[i].getDistance(state.action.fl)
                }
            }
        }, next: "sendCommands",
    },
    getTree: {
        getTree: (mgrs, state) => {
            let minDistance = 100000
            let mainId = 0
            for (let i = 0; i < state.distances.length; i++) {
                if (state.distances[i] < minDistance) {
                    minDistance = state.distances[i]
                    mainId = state.ids[i]
                }
            }

            trees = []
            // console.log(state.ids)
            for (let i = 0; i < mgrs.length; i++) {
                if (state.ids[i] === mainId) {
                    DecideTree.state.action = state.action
                    trees.push(DecideTree)
                } else {
                    DecideTreeSupport.state.sequence = [{act: FL, fl: `^p.*Supercomputer.*${mainId}.*`}]
                    console.log(state.ids[i])
                    // console.log(DecideTreeSupport.state.action)
                    trees.push(DecideTreeSupport)
                }
            }
            state.distances = [0, 0, 0]

            return trees
        }
    }
}