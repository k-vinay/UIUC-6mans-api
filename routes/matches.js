module.exports = function(router, Match) {
    
    var matchesRoute = router.route('/matches');

    matchesRoute.get(async function(req, res) {
        try {
            let query = req.query;
            Object.keys(query).forEach(key => {
                query[key] = JSON.parse(query[key]);
            });
            let matches;
            if(query.count) 
                matches = await Match.find(query.where, query.select, query).count();
            else
                matches = await Match.find(query.where, query.select, query).lean().exec();

            res.json({ message: "OK", data: matches });
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Error in your query, or unable to fetch"});
        }
    });
    matchesRoute.post(async function (req, res) {
        try {
            const newMatch = new Match(req.body);
            const result = await newMatch.save();
            res.json({ message: result ? "OK" : "ERROR", data: result });
        } catch (err) {
            res.status(500).json({message: "Invalid match provided, or unable to insert"});
        }
    });

    return router;
}