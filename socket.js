const dgram = require('dgram');

module.exports = (agent, teamName, version, goalie) => {
    return new Promise((resolve) => {
        const socket = dgram.createSocket({type: 'udp4', reuseAddr: true});

        agent.setSocket(socket);

        socket.on('message', (msg, info) => {
            agent.msgGot(msg);
        });

        socket.sendMsg = (msg) => {
            return new Promise((resolve, reject) => {
                socket.send(Buffer.from(msg), 6000, 'localhost', (err, bytes) => {
                    if (err) reject(err);
                    resolve(bytes);
                });
            });
        };

        const initMsg = goalie 
            ? `(init ${teamName} (version ${version}) (goalie))`
            : `(init ${teamName} (version ${version}))`;

        socket.sendMsg(initMsg)
            .then(() => resolve());
    });
};