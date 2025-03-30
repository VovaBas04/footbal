const Goalie_ctrl_low = {
	execute(infoAnalyzer, controllers){
		const next = controllers[0];
		infoAnalyzer.canKick = infoAnalyzer.state.ball && infoAnalyzer.state.ball.dist < 1;
		if (next){
			return next.execute(infoAnalyzer, controllers.slice(1));
		} 
	}
}

module.exports = Goalie_ctrl_low;