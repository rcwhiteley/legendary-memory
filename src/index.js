const app = require('./config/server');
require('./app/routes/posiciones')(app);
const api = require('./api/routes/api');
app.use('/api', api);
//starting the server
console.log( new Date().toLocaleDateString("es-ES", {year:"numeric",month:"2-digit", day:"2-digit"}));
app.listen(app.get('port'), () =>{
    console.log('server on port', app.get('port'));
});
/*2017-06-01T08:30
2018-06-25T05:16*/
