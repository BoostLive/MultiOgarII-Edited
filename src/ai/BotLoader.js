// Library imports
const fs = require("fs");

// Project imports
const FakeSocket = require('./FakeSocket');
const PacketHandler = require('../PacketHandler');
const BotPlayer = require('./BotPlayer');
const MinionPlayer = require('./MinionPlayer');

class BotLoader {

    constructor(server) {
        this.server = server;
        this.botCount = 0;
        this.loadNames();
    }

    loadNames() {
        this.randomNames = [];
    
        if (fs.existsSync("./botnames.txt")) {
            // Read and parse the names - filter out whitespace-only names
            this.randomNames = fs.readFileSync("./botnames.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
                return x != ''; // filter empty names
            });
        }
        this.nameIndex = 0;
    }

    getName() {
        var name = "";

        // Picks a random name for the bot
        if (this.randomNames.length > 0) {
            var index = (this.randomNames.length * Math.random()) >>> 0;
            name = this.randomNames[index];
        } else {
            name = "bot" + ++this.nameIndex;
        }
        return name;
    }

    addBot() {

        // Create a FakeSocket instance and assign it's properties.
        const socket = new FakeSocket(this.server);
        socket.playerTracker = new BotPlayer(this.server, socket);
        socket.packetHandler = new PacketHandler(this.server, socket);

        // Add to client list and spawn.
        this.server.clients.push(socket);
        socket.packetHandler.setNickname(this.getName());
    }
    
    addMinion(owner, name, mass) {

        // Aliases
        const maxSize = this.server.config.minionMaxStartSize;
        const defaultSize = this.server.config.minionStartSize;

        // Create a FakeSocket instance and assign it's properties.
        const socket = new FakeSocket(this.server);
        socket.playerTracker = new MinionPlayer(this.server, socket, owner);
        socket.packetHandler = new PacketHandler(this.server, socket);

        // Set minion spawn size
        socket.playerTracker.spawnmass = mass || maxSize > defaultSize ? Math.floor(Math.random() * (maxSize - defaultSize) + defaultSize) : defaultSize;

        // Add to client list
        this.server.clients.push(socket);

        // Add to world
        socket.packetHandler.setNickname(name == "" || !name ? this.server.config.defaultName : name);
    }
}

module.exports = BotLoader;
