const utils = require("./utils");

const CTRL_LOW = {
	execute(infoAnalyzer, controllers, bottom, top, direction, center){
		if (!infoAnalyzer.state.pos){
			return {n: "turn", v: 10};
		}
		const next = controllers[0];
		if (!infoAnalyzer.state.ball){
			//console.log("return in Zone");
			let act = utils.returnInZone(infoAnalyzer.state.pos.y, bottom, top, direction, infoAnalyzer);
			if (act){
				return act;
			}
			//console.log("in Zone. Finding ball");
			return utils.turn(1, 90);
		}
		if (next){
			return next.execute(infoAnalyzer, controllers.slice(1), bottom, top, direction, center);
		} 
	}
}

module.exports = CTRL_LOW;