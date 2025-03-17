const Flags = require('./flags')
module.exports =  {
    time : 0,
    pos : 0,
    hear : [],
    ballPrev : {x : Flags['fc'].x, y: Flags['fc'].y, dist : 20, angle : 0},
    ball : {x : Flags['fc'].x, y: Flags['fc'].y, dist : 20, angle : 0},
    teamOwn : [],
    team : [],
    goalOwn : Flags['gl'],
    goal : Flags['gr']
}