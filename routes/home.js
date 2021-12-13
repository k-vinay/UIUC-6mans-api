module.exports = function (router) {

    router.route('/').get(function (req, res) {
        res.status(200).send("Hello World!\nApp Engine Test");
    });

    router.route('/help').get(function (req, res) {
        res.status(200).send("View the docs on GitHub: <url>");
    });

    return router;
}
