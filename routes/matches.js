module.exports = function (router, Match, User) {

    var matchesRoute = router.route('/matches');

    matchesRoute.get(async function (req, res) {
        try {
            let query = req.query;
            Object.keys(query).forEach(key => {
                query[key] = JSON.parse(query[key]);
            });
            let matches;
            if (query.count)
                matches = await Match.find(query.where, query.select, query).count();
            else
                matches = await Match.find(query.where, query.select, query).lean().exec();
            res.json({ message: "OK", data: matches });
        } catch (err) {
            res.status(500).json({ message: "Error in your query, or unable to fetch" });
        }
    });

    var matchRoute = router.route('/matches/:id');
    matchRoute.get(async function (req, res) {
        try {
            const match = await Match.find({ _id: req.params.id }).lean().exec();
            if (match.length) {
                res.json({ message: "OK", data: match[0] });
            } else res.status(404).json({ message: "Id not found" });
        } catch (err) {
            res.status(500).json({ message: "Malformed id, or unable to delete" });
        }
    });
    matchRoute.delete(async function (req, res) {
        try {
            const match = await Match.find({ _id: req.params.id }).exec();
            if (match.length) {
                await Match.findByIdAndDelete(req.params.id);
                res.json({ message: "OK" });
            } else res.status(404).json({ message: "Id not found" });
        } catch (err) {
            res.status(500).json({ message: "Malformed id, or unable to delete" });
        }
    });

    function calculateEloDiff(team1, team2, result) {
        if (result) {
            res = [10, 10];
            res[result % 2] *= -1;
            return res;
        } else return [0, 0];
    }

    var reportRoute = router.route('/matches/report');
    reportRoute.post(async function (req, res) {
        try {
            let reportBody = req.body
            reportBody.result = parseInt(reportBody.result)
            if (!([0, 1, 2].includes(reportBody.result)))
                return res.status(500).json({ message: "Result must be one of 0,1,2" });

            for (let username of reportBody.team1) {
                if (reportBody.team2.includes(username))
                    return res.status(500).json({ message: "Player can't be on both teams" });
                if (typeof username != "string")
                    return res.status(500).json({ message: "Usernames must be strings" });
            };
            for (let username of reportBody.team2) {
                if (typeof username != "string")
                    return res.status(500).json({ message: "Usernames must be strings" });
            };
            let team1 = await User.find({username: {$in: reportBody.team1}});
            let team2 = await User.find({username: {$in: reportBody.team2}});
            eloDiffs = calculateEloDiff(team1, team2, reportBody.result);

            let matchData = {
                team1: team1.map(user => { return {
                    username: user.username,
                    nickname: user.nickname,
                    elo: user.elo
                }}),
                team2: team2.map(user => { return {
                    username: user.username,
                    nickname: user.nickname,
                    elo: user.elo
                }}),
                result: reportBody.result,
                team1EloDiff: eloDiffs[0],
                team2EloDiff: eloDiffs[1]
            }
            if (reportBody.matchDate)
                matchData.matchDate = reportBody.matchDate;

            let newMatch = new Match(matchData);
            let newUsers = team1.map(user => {
                user.elo += eloDiffs[0];
                return user;
            }).concat(team2.map(user => {
                user.elo += eloDiffs[1];
                return user;
            }));

            for(let newUser of newUsers) {
                await newUser.validate();
            }
            
            const result = await newMatch.save();
            for(let newUser of newUsers) {
                await newUser.save();
            }
            res.json({ message: result ? "OK" : "ERROR", data: result });

        } catch (err) {
            res.status(500).json({ message: "Error while reporting. Check your report data." });
        }
    });

    return router;
}