const pg = require('pg'),
    srcDB = '',
    distDB = '',

    tables = ['administrators', 'chambermaids', 'rating', 'users'];

pg.defaults.ssl = true;

const srcPool = pg.Pool({
    connectionString: srcDB
});

const distPool = pg.Pool({
    connectionString: distDB
});

for (let tablesKey in tables) {
    srcPool.query(`SELECT * FROM ${tables[tablesKey]}`, (error, data) => {
        console.log(error);
        if (data.rows.length === 0) return;

        for (let dataKey in data.rows) {
            let queryParamNames = '', queryParamNumbers = '', queryData = [], i = 1;
            for (let queryKey in data.rows[dataKey]) {
                queryParamNames += `${queryKey}, `;
                queryParamNumbers += `$${i}, `;
                i++;
                queryData = [...queryData, data.rows[dataKey][queryKey]];
            }
            queryParamNames = queryParamNames.substring(0, queryParamNames.length - 2);
            queryParamNumbers = queryParamNumbers.substring(0, queryParamNumbers.length - 2);

            distPool.query(`INSERT INTO ${tables[tablesKey]}(${queryParamNames}) VALUES(${queryParamNumbers})`, queryData,(error, data) => {
                console.log(error);
            });
        }
    });
}