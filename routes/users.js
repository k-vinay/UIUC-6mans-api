module.exports = function (router, User, Rank) {

    var usersRoute = router.route('/users');

    usersRoute.get(async function (req, res) {
        try {
            let query = req.query;
            Object.keys(query).forEach(key => {
                query[key] = JSON.parse(query[key]);
            });
            let users;
            if(query.count) 
                users = await User.find(query.where, query.select, query).count();
            else
                users = await User.find(query.where, query.select, query).lean().exec();
            
            let rankedUsers = [];
            for(let user of users) {
                const rank = await Rank.findOne({upperBound: {'$gt': user.elo}, lowerBound: {'$lte': user.elo}}, {name: 1, _id: 0}).exec();
                user.rank = rank.name;
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

    var userRoute = router.route('/users/:id');
    userRoute.get(async function (req, res) {
        try {
            const user = await User.findOne({ _id: req.params.id }).lean().exec();
            if(!user) return res.status(404).json({message: "Id not found"});
            const rank = await Rank.findOne({upperBound: {'$gt': user.elo}, lowerBound: {'$lte': user.elo}}, {name: 1, _id: 0}).exec();
            user.rank = rank.name;
            return res.json({ message: "OK", data: user });
        } catch (err) {
            res.status(500).json({message: "Malformed id provided, or unable to fetch"});
        }
    });
    // userRoute.put(async function (req, res) {
    //     try {
    //         const user = await User.find({ _id: req.params.id }).exec();
    //         if (user.length) {
    //             await User.replaceOne({_id: req.params.id}, req.body).exec();
    //             const result = await User.find({ _id: req.params.id }).exec();
    //             res.json({message: "OK", data: result[0]});
    //         } else res.status(404).json({message: "Id not found"});
    //     } catch (err) {
    //         res.status(500).json({message: "Malformed id provided, invalid user provided, or unable to update"});
    //     }
    // });
    userRoute.delete(async function (req, res) {
        try {
            const user = await User.find({ _id: req.params.id }).exec();
            if (user.length) {
                await User.findByIdAndDelete(req.params.id);
                res.json({message: "OK"});
            } else res.status(404).json({message: "Id not found"});
        } catch (err) {
            res.status(500).json({message: "Malformed id, or unable to delete"});
        }
    });

    return router;
}