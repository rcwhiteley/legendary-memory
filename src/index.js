const app = require('./config/server');
require('./app/routes/posiciones')(app);
const api = require('./api/routes/api');
const log = require('./config/logger');

app.use('/api', api);
app.listen(app.get('port'), () =>{
    log.info('server on port', app.get('port'));
});
