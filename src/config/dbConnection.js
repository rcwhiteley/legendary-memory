const mysql = require('mysql');

module.exports = () => {
    return mysql.createConnection({
        host: 'db4free.net',
        user: 'pinera',
        password: 'pineraql',
        database: 'futbol_udec'
    });
};