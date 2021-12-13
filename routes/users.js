module.exports = function (router, User, Rank) {

    var usersRoute = router.route('/users');

    usersRoute.get(async function (req, res) {
        try {
            let query = req.query;
            Object.keys(query).forEach(key => {
                try {
                    query[key] = JSON.parse(query[key]);
                } catch (e) {}
            });
            let users;
            const selectRank = (!query.select) || query.select.rank;
            const selectElo = (!query.select) || query.select.elo;
            if (query.select?.rank) {
                delete query.select.rank;
                query.select.elo = 1;
            }
            if(query.count) 
                users = await User.find(query.where, query.select, query).count();
            else
                users = await User.find(query.where, query.select, query).lean().exec();
            
            if (!selectRank)
                return res.json({ message: "OK", data: users });
            
            let rankedUsers = [];
            for(let user of users) {
                const rank = await Rank.findOne({upperBound: {'$gt': user.elo}, lowerBound: {'$lte': user.elo}}, {name: 1, _id: 0}).lean().exec();
                user.rank = rank.name;
                if (!selectElo)
                    delete user.elo;
                rankedUsers.push(user);
            };

            res.json({ message: "OK", data: rankedUsers });
        } catch (err) {
            res.status(500).json({message: "Error in your query, or unable to fetch"});
        }
    });
    usersRoute.post(async function (req, res) {
        try {
            const newUser = new User(req.body);
            const result = await newUser.save();
            res.json({ message: result ? "OK" : "ERROR", data: result });
        } catch (err) {
            res.status(500).json({message: "Invalid user provided, or unable to insert"});
        }
    });

    var userRoute = router.route('/users/:username');
    userRoute.get(async function (req, res) {
        try {
            const user = await User.findOne({ username: req.params.username }).lean().exec();
            if(!user) return res.status(404).json({message: "User not found"});
            const rank = await Rank.findOne({upperBound: {'$gt': user.elo}, lowerBound: {'$lte': user.elo}}, {name: 1, _id: 0}).exec();
            user.rank = rank.name;
            return res.json({ message: "OK", data: user });
        } catch (err) {
            res.status(500).json({message: "Malformed username provided, or unable to fetch"});
        }
    });
    userRoute.put(async function (req, res) {
        try {
            const user = await User.find({ username: req.params.username }).exec();
            if (user.length) {
                await User.replaceOne({username: req.params.username}, req.body).exec();
                const result = await User.find({ username: req.params.username }).exec();
                res.json({message: "OK", data: result[0]});
            } else res.status(404).json({message: "Username not found"});
        } catch (err) {
            res.status(500).json({message: "Malformed username provided, invalid user provided, or unable to update"});
        }
    });
    userRoute.delete(async function (req, res) {
        try {
            const user = await User.find({ username: req.params.username }).exec();
            if (user.length) {
                await User.findByIdAndDelete(user[0]._id);
                res.json({message: "OK"});
            } else res.status(404).json({message: "username not found"});
        } catch (err) {
            res.status(500).json({message: "Malformed username, or unable to delete"});
        }
    });

    return router;
}