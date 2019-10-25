const router = require('express').Router();

router.get('/:uuid', (req, res, next) => {
    res.render('post', { title: 'Online Path Tracer', uuid: req.params.uuid });
})

module.exports = router;
