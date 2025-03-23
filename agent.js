const Msg = require('./msg');
const utils = require("./utils");
const Flags = require('./flags');
const InfoAnalyzer = require("./infoAnalyzer");

// имя первого игрока: p"A"1

class Agent {
    constructor(teamName, goalkeeper) {
        this.position = 'l'; // По умолчанию - левая половина поля
        this.run = true; // Игра начата
        this.act = null; // Действия
        this.teamName = teamName;
        this.state = {'time': 0};
        this.infoAnalyzer = new InfoAnalyzer();
        this.infoAnalyzer.team = teamName;
        this.controllers = null;


        this.bottom = null;
        this.top = null;
        this.center = null;
        this.direction = null;

    }

    msgGot(msg) {
        // Получение сообщения
        let data = msg.toString(); // Приведение
        this.processMsg(data); // Разбор сообщения
        this.sendCmd(); // Отправка команды
    }

    setSocket(socket) {
        // Настройка сокета
        this.socket = socket;
    }

    socketSend(cmd, value, goalie) {
        // Отправка команды
        return this.socket.sendMsg(`(${cmd} ${value})`);
    }

    processMsg(msg) {
        // Обработка сообщения
        let data = Msg.parseMsg(msg); // Разбор сообщения
        if (!data) throw new Error('Parse error\n' + msg);
        if (data.cmd === 'init') this.initAgent(data.p); // Инициализация
        this.analyzeEnv(data.msg, data.cmd, data.p); // Обработка
    }

    initAgent(p) {
        if (p[0] === 'r') this.position = 'r'; // Правая половина поля
        if (p[1]) this.id = p[1]; // id игрока
    }

    writeHearData(data){
        this.state['hear'] = {"who": data[0], "msg": data[1]};
    }

    analyzeEnv(msg, cmd, p) {
        //this.act = {n: "dash", v: -30};
        //return;




        if (cmd == "hear"){
            console.log(p);
            if (p[2].includes("kick") && p[2] != "before_kick_off"){
                if (!p[2].includes(this.infoAnalyzer.side)){
                    this.run = false;
                } 
                if (p[2].includes(this.infoAnalyzer.side)){
                    this.run = true;
                    this.infoAnalyzer.kick = true;
                }
            }
            if (p[2].includes("goal") || p[2] === "before_kick_off"){
                this.act = {n: "move", v: this.start_x + " " + this.start_y}
                this.infoAnalyzer.action = "return";
                this.infoAnalyzer.turnData = "ft0";
                return;
                //'move', `${player.start_x} ${player.start_y}`
            }

            if (p[2].includes("play")){
                this.run = true;
                this.infoAnalyzer.kick = false;
            }
        }

        if (cmd === "init"){
            this.infoAnalyzer.side = p[0];           
        }

        if (cmd === "sense_body"){
            //console.log(p);
            //console.log("Direction!!!!", p[3]['p'][1], p[0]);
            this.direction = p[3]['p'][1];
        }  

        if (cmd === "see"){
            if (this.next_act){
                this.act = this.next_act;
                //console.log("ACT: ", this.act, p[0]);
                this.next_act = null;
                return;
            }

            //console.log(this.infoAnalyzer.state['ball']);
            this.infoAnalyzer.state['time'] = p[0];
            this.infoAnalyzer.set(p);

            if (this.controllers){
                this.act = this.controllers[0].execute(this.infoAnalyzer, this.controllers, this.bottom, this.top, this.direction, this.center);
                //console.log(this.act);
                if (Array.isArray(this.act)){
                    this.next_act = this.act[1];
                    this.act = this.act[0];
                    
                    //console.log("act", this.act);
                    //console.log("next_act", this.next_act);
                } 
                //console.log("ACT: ", this.act, p[0]);
            }

            // Вызов автомата
            this.infoAnalyzer.resetState();
        }

        if (cmd === "hear"){
            this.writeHearData(p);
        }

        if (cmd === "sense_body"){
            this.infoAnalyzer.writeSenseData(p);
        }
    }

    sendCmd() {
        //console.log(this.act);
        if (this.run) {
            // Игра начата
            if (this.act) {
                if (this.act.n == "move"){
                    this.run = false;
                }
                // Есть команда от игрока
                if (this.act.n === 'kick')
                    // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v);
                // Движение и поворот
                else this.socketSend(this.act.n, this.act.v);
            }
            this.act = null; // Сброс команды
        }
    }
}

module.exports = Agent;

