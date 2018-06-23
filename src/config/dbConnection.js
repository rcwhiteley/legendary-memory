const mysql = require('mysql');

module.exports = () => {
    return mysql.createConnection({
        /*host: 'localhost',
        user: 'root',
        password: '3090323',
        database: 'futbol_db'*/

        host: 'db4free.net',
        user: 'pineraql1',
        password: 'pineraql1',
        database: 'futbol_db'

    });
};