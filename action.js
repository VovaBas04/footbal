const Manager = require('./manager')
module.exports = function getAction(dt, p, cmd, print = false) {
    let manager = new Manager(p)
    // console.log(cmd)

    function execute(dt, title) {
        if(print) console.log(title)
        if (dt.state.print) {
            console.log(title, dt.state.isCatch)
        }
        const action = dt[title]
        if (typeof action.exec == "function") {
            action.exec(manager, dt.state, p, cmd)
            return execute(dt, action.next)
        }
        if (typeof action.condition == "function") {
            const cond = action.condition(manager, dt.state, p, cmd)
            if (cond)
                return execute(dt, action.trueCond)
            return execute(dt, action.falseCond)
        }
        if (typeof action.command == "function") {
            // console.log(action.command(manager, dt.state, p, cmd))
            return action.command(manager, dt.state, p, cmd)
        }
        throw new Error(`Unexpected command in DT ${title}`)
    }

    return execute(dt, "root")
}