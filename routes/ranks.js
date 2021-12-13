module.exports = function(router, Rank) {

    router.route('/ranks').get(async function (req, res) {
        try {
            let query = req.query;
            Object.keys(query).forEach(key => {
                query[key] = JSON.parse(query[key]);
            });
            let ranks;
            if(query.count) 
                ranks = await Rank.find(query.where, query.select, query).count();
            else
                ranks = await Rank.find(query.where, query.select, query).lean().exec();
            res.json({ message: "OK", data: ranks });
        } catch (err) {
            res.status(500).json({message: "Error in your query, or unable to fetch"});
        }
    });

    router.route('/ranks/:rank').get(async function (req, res) {
        try {
            const rank = await Rank.findOne({ username: `Rank ${req.params.rank}` }).lean().exec();
            if(!rank) return res.status(404).json({message: "Rank not found"});
            return res.json({ message: "OK", data: rank });
        } catch (err) {
            res.status(500).json({message: "Bad rank provided, or unable to fetch"});
        }
    });

    return router;
}