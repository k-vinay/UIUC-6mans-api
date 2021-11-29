module.exports = function (router) {

    var homeRoute = router.route('/');

    homeRoute.get(function (req, res) {
        res.status(200).send("Hello World!\nApp Engine Test");
    });

    return router;
}
