module.exports = function (router) {

    router.route('/').get(function (req, res) {
        res.status(200).send("Hello World!\nApp Engine Test");
    });

    router.route('/help').get(function (req, res) {
        res.status(200).send("View the code/documentation on GitHub: https://github.com/k-vinay/UIUC-6mans-api");
    });

    return router;
}
