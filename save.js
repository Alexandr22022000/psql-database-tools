const pg = require('pg'),
    fs = require('fs'),
    CryptoJS = require('crypto-js'),

    srcDB = 'postgres://test00:0000@localhost:5432/secret-database-00',
    distFile = 'data.backup',
    key = '0000',

    tables = ['main'];

//pg.defaults.ssl = true;

const srcPool = pg.Pool({
    connectionString: srcDB
});

const databaseJson = {};

const isOk = [];
for (let key in tables)
    isOk.push(false);

for (let tablesKey in tables) {
    srcPool.query(`SELECT * FROM ${tables[tablesKey]}`, (error, data) => {
        databaseJson[tables[tablesKey]] = data.rows;

        isOk[tablesKey] = true;

        let isEnd = true;
        for (let key in isOk) {
            if (!isOk[key]) isEnd = false;
        }

        if (isEnd) {
            srcPool.end();

            let databaseString = JSON.stringify(databaseJson);
            if (key) {
                databaseString = CryptoJS.DES.encrypt(databaseString, key).toString();
            }
            fs.writeFile(distFile, databaseString);

            console.log("Finished!!!");
        }
    });
}