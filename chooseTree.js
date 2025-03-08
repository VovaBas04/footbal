const FL = "flag", KI = "kick"
const DecideTree = require('./mainTree.js');
const DecideTreeSupport = require('./supportTree.js');
module.exports = {
    state: {
        print : true,
        next: 0,
        value : 0,
        sequence: [{act: FL, fl: "b"}, {act: FL, fl: "gl"}, {act: KI, fl: "b", goal: "gr"}],
        commands: []
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next];
            state.commands = []
        },
        next: "isVisiblePlayer"
    },
    isVisiblePlayer: {
        condition: (mgrs, state) => mgrs.filter(mgr => !mgr.getVisible(state.action.fl)).length <= 1,
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
                }
            }
        }, next: "sendCommands",
    },
    getTree: {
        getTree: (mgrs, state) => {
            trees = []
            let isMain = false
            for (let i = 0; i < mgrs.length - 1; i++) {
                if (mgrs[i].getVisible(state.action.fl)) {
                    trees.push(DecideTreeSupport)
                } else {
                    isMain = true
                    DecideTree.state.action = state.action
                    trees.push(DecideTree)
                }
            }
            if (isMain) {
                trees.push(DecideTreeSupport)
            } else {
                DecideTree.state.action = state.action
                trees.push(DecideTree)
            }

            return trees
        }
    }
}