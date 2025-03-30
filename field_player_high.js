const utils = require("./utils");

const CTRL_HIGH = {
	execute(infoAnalyzer, controllers, bottom, top, direction, center){
		let act;
		if (infoAnalyzer.state.ball.dist <= 0.5){
			if (infoAnalyzer.kick){
				act = utils.pass(infoAnalyzer);
				if (act){
					return act;
				} else {
					return {n: "kick", v: "60 180"}
				}

			}
			let side = infoAnalyzer.side;
			if (side == "l"){
				if (infoAnalyzer.state.ball){
					if (infoAnalyzer.state.ball.y >= 27){
						return {n: "kick", v: "10 -45"}
					} else if (infoAnalyzer.state.ball.y <= -27){
						return {n: "kick", v: "10 45"}
					}
				}
			} else {
				if (infoAnalyzer.state.ball){
					if (infoAnalyzer.state.ball.y >= 29){
						return {n: "kick", v: "10 45"}
					} else if (infoAnalyzer.state.ball.y <= -29){
						return {n: "kick", v: "10 -45"}
					}
				}
			}
			

			if (infoAnalyzer.state.pos){
				if (infoAnalyzer.state.pos.x >= 28 && infoAnalyzer.side == 'l' ||
					infoAnalyzer.state.pos.x <= -28 && infoAnalyzer.side == 'r'){
					return utils.kick(infoAnalyzer);

				}
			}

			act = utils.pass(infoAnalyzer);
			if (act){
				return act;
			} else {
				if (!utils.seeDir(infoAnalyzer)){
					return {n: "kick", v: "10 45"};
				}
				act = utils.forward(infoAnalyzer);
				if (!act){
					return {n: "kick", v: "10 45"}
				}
				return act;
			}

		}


		if (infoAnalyzer.state.ball.dist >= 5){
			for (const player of infoAnalyzer.state.myTeam){
				if (player.dist < 10){
					return null;
				}
			}
			act = utils.returnInZone(infoAnalyzer.state.pos.y, bottom, top, direction, infoAnalyzer);
			if (act){
				return act;
			}
			let x = infoAnalyzer.state.pos.x;
			let y = infoAnalyzer.state.pos.y;
			return utils.go2ball(x, y, bottom, top, center, infoAnalyzer.state.ball.angle, direction, infoAnalyzer);			
		}

		let teamTake = utils.teamTaken(infoAnalyzer);
		if (!teamTake){
			return utils.takeBall(infoAnalyzer.state.ball.dist, infoAnalyzer.state.ball.angle);	
		} else {
			act = utils.returnInZone(infoAnalyzer.state.pos.y, bottom, top, direction, infoAnalyzer);
			if (act){
				return act;
			}			
		}
		
	}
}

module.exports = CTRL_HIGH;