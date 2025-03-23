const CTRL_LOW = {
	execute(infoAnalyzer, controllers){
		const next = controllers[0];
		infoAnalyzer.canKick = infoAnalyzer.state.ball && infoAnalyzer.state.ball.dist < 1;
		//infoAnalyzer.canCatch = infoAnalyzer.state.ball && infoAnalyzer.state.ball.dist < 2;
		if (next){
			return next.execute(infoAnalyzer, controllers.slice(1));
		} 
	}
}

module.exports = CTRL_LOW;