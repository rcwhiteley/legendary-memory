const dbConnection = require('../../config/dbConnection');
const db = require('../../database/mysqldal');
module.exports = app => {

    /*app.get('/:pagina', (req,res)=> {

    });*/

    app.get('/agregarequipo',(req, res) => {
        console.log("aca");
        db.getTeams((err, result) => {
            console.log(result);
            res.render('dinamico/agregarequipo', {
                equipos: result
            });
        });
    });

    app.get('/tablaposiciones', (req,res) =>{
        db.getStandings(1, (err, result) => {
            console.log(result);
            res.render('dinamico/tabladeposiciones', {
                tabla: result
            });
        });
    });
    app.post('/agregarequipo', (req, res) =>{
        db.addTeam(req.body.title, req.body.equipos, (err, result) => {
            res.redirect('/agregarequipo');
        });
    });

    app.get('/partidos', (req, res)=>{
       db.getGames(1, (err, result)=>{
           console.log(result);
           res.render('dinamico/partidos', {
               partidos: result
          });
       });
    });
};