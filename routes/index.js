/*
 * Connect all of your endpoints together here.
 */
module.exports = function (app, router, mongoose) {
    const Schema = mongoose.Schema;

    const User = mongoose.model('User', new Schema({
        name: {type: String, required: true},
        elo: {type: Number, default: 1000},
        discordId: {type: Number, default: -1},
        discordTag: {type: String, default: "N/A"},
        dateCreated: {type: Date, default: Date.now}
    }));

    const Rank = mongoose.model('Rank', new Schema({
        name: {type: String, required: true},
        lowerBound: {type: Number},
        upperBound: {type: Number}
    }));

    const Match = mongoose.model('Match', new Schema({
        team1: [User.schema],
        team2: [User.schema],
        result: {type: Number, default: -1},
        team1EloDiff: {type: Number, default: 0},
        team2EloDiff: {type: Number, default: 0}
    }));

    app.use('/api', require('./home.js')(router));
    app.use('/api', require('./users.js')(router, User, Rank));
    app.use('/api', require('./matches.js')(router, Match));
};
