const express = require('express');
const router = express.Router();
const log = require('../../config/logger');
const db = require('../../database/mysqldal');

router.get('/', function(req, res){
    db.getSeasons(function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener temporadas, error:", err);
            res.sendStatus(500);
        }
        else{
            res.status(200).send(result);
        }
    }) ;
});

router.get('/:season/tournaments', function(req, res){
    db.getSeasonTournaments(req.params.season, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener torneos en temporada", req.params.season, ", error:", err);
        }
        else{
            res.status(200).send(result);
        }
    }) ;
});


module.exports = router;