const express = require('express');
const router = express.Router();
const log = require('../../config/logger');
const db = require('../../database/mysqldal');


router.get('/:tourny/standings', function(req, res) {
    db.getStandings(req.params.tourny, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener posiciones, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.get('/', function(req, res){
    db.getTournies(function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener torneos, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.post('/', function(req, res){
    log.debug("post", req.originalUrl);
    res.sendStatus(200);
});

router.get('/:tourny/fixtures', function(req, res){
    db.getGames(req.params.tourny, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener partidos, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.post('/:tourny/fixtures', function(req, res){
    log.debug("post", req.originalUrl);
    res.sendStatus(200);
});

router.get('/:tourny/teams', function(req, res){
    log.debug("intentando obtener torneos");
    db.getTeamsInTourny(req.params.tourny, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener equipos, error:", err)
            res.sendStatus(500);
        }
        else {
            log.debug("enviando status 200");
            res.status(200).send(result);
        }
    });
});

router.post('/:tourny/teams', function(req, res){
    log.debug("post", req.originalUrl);
    res.sendStatus(200);
});

router.get('/:tourny/goalscorers', function(req, res){
    db.getGoalScorers(req.params.tourny, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener goleadores, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.get('/:tourny/teams/:name', function (req, res) {
    db.getTeamPlayersInTourny(req.params.tourny, req.params.name, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener plantel en torneo, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});


module.exports = router;