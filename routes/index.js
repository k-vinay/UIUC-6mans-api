/*
 * Connect all of your endpoints together here.
 */
module.exports = function (app, router, mongoose) {
    const Schema = mongoose.Schema;

    const User = mongoose.model('User', new Schema({
        username: { type: String, required: true, unique: true },
        nickname: { type: String },
        elo: { type: Number, default: 1000, index: true, min: 0, max: 9999},
        discordId: { type: Number, default: -1 },
        discordTag: { type: String, default: "N/A" },
        dateCreated: { type: Date, default: Date.now }
    }));

    const Rank = mongoose.model('Rank', new Schema({
        name: { type: String, required: true },
        lowerBound: { type: Number },
        upperBound: { type: Number }
    }));

    const Match = mongoose.model('Match', new Schema({
        team1: [
            {
                username: { type: String, required: true },
                nickname: { type: String },
                elo: { type: Number, required: true },
            }
        ],
        team2: [
            {
                username: { type: String, required: true },
                nickname: { type: String },
                elo: { type: Number, required: true },
            }
        ],
        result: { type: Number, default: 0 , enum: [0,1,2]},
        team1EloDiff: { type: Number, default: 0 },
        team2EloDiff: { type: Number, default: 0 },
        matchDate: {type: Date, default: Date.now}
    }));

    app.use('/api', require('./home.js')(router));
    app.use('/api', require('./ranks.js')(router, Rank));
    app.use('/api', require('./users.js')(router, User, Rank));
    app.use('/api', require('./matches.js')(router, Match, User));
};
