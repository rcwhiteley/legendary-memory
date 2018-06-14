const app = require('./config/server');
require('./app/routes/posiciones')(app);
const api = require('./api/routes/api');
app.use('/api', api);
//starting the server
app.listen(app.get('port'), () =>{
    console.log('server on port', app.get('port'));
});