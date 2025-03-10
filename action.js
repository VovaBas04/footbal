const Manager = require('./manager')
module.exports = function getAction(dt, p) {
    this.p = p
    let manager = new Manager(p)

    function execute(dt, title) {
        if (dt.state.print) {
            console.log(title, dt.state.isCatch)
        }
        const action = dt[title]
        if (typeof action.exec == "function") {
            action.exec(manager, dt.state)
            return execute(dt, action.next)
        }
        if (typeof action.condition == "function") {
            const cond = action.condition(manager, dt.state)
            if (cond)
                return execute(dt, action.trueCond)
            return execute(dt, action.falseCond)
        }
        if (typeof action.command == "function") {
            return action.command(manager, dt.state)
        }
        if (typeof action.changeTree == "function") {
            return true
        }
        throw new Error(`Unexpected command in DT ${dt.state}`)
    }

    return execute(dt, "root")
}