const express = require('express');
const router = express.Router();
const log = require('../../config/logger');
const db = require('../../database/mysqldal');
const fs = require('fs');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.use(function timeLog(req, res, next) {
    //console.log("middle");
    log.debug("recibiendo llamada a", req.originalUrl)
    // por si se agrega algun middleware
    next();
});
router.use('/fixtures', require('./fixtures'));
router.use('/tournaments', require('./tournaments'));
router.use('/seasons', require('./seasons'));

router.get('/logo/:team', function(req, res){
    let logo = './src/public/' + req.params.team + ".png";
    let def = './src/public/nologo.png';

    if(!fs.existsSync(logo))
        logo = def;
    fs.readFile(logo, 'base64', function (err, contents) {
        if (err) {
            console.log(err);
        }
        res.setHeader("Cache-Control"," max-age=3600");

        res.status(200).send({image: contents});
    });
});

router.post('/logo/:team', function(req, res){
    log.debug("post", req.originalUrl);
    res.sendStatus(200);
});

router.get('/equipos/:equipo/partidos/:partido/jugadores', function (req, res) {
    db.getTeamPlayersInGame(req.params.equipo, req.params.partido, function (err, result) {
        if(err){
            log.debug(err);
            res.sendStatus(500);
        }
        else{
            res.send(result);
        }
    });
});

router.post('/equipos/:equipo/partidos/:partido/jugadores', function (req, res) {
    log.debug("editando juagador", JSON.stringify(req.body));
    log.debug("en partido", req.params.partido);
    log.debug("jugador matricula", req.body.jugadores_matricula);
    log.debug("con titularidad", req.body.titularidad);
    db.addOrUpdatePlayerInGame(req.params.partido, req.body, function (err, result) {
        log.debug(err, result);
        res.sendStatus(200);
    });
});



module.exports = router;