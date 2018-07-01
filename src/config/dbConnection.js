const mysql = require('mysql');

module.exports = () => {
    return mysql.createConnection({
        host: 'db4free.net',
        user: 'pineraql1',
        password: 'pineraql1',
        database: 'futbol_db',
        multipleStatements: true
    });
};