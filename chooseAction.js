const Manager = require('./manager')
module.exports = function getTree(dt, playersData) {
    let managers = []
    for (let index in playersData) {
        managers.push(new Manager(playersData[index]))
    }

    function execute(dt, title) {
        const action = dt[title]
        if (typeof action.exec == "function") {
            action.exec(managers, dt.state)
            return execute(dt, action.next)
        }
        if (typeof action.condition == "function") {
            const cond = action.condition(managers, dt.state)
            if (cond)
                return execute(dt, action.trueCond)
            return execute(dt, action.falseCond)
        }
        if (typeof action.command == "function") {
            return {
                'value': action.command(managers, dt.state),
                'type': 'action'
            }
        }
        if (typeof action.getTree == "function") {
            return {
                'value': action.getTree(managers, dt.state),
                'type': 'tree'
            }
        }
        throw new Error(`Unexpected command in DT ${dt.state}`)
    }

    return execute(dt, "root")
}