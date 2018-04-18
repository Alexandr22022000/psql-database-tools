const pg = require('pg'),
    fs = require('fs'),
    CryptoJS = require('crypto-js'),

    srcFile = 'data.backup',
    distDB = 'postgres://test00:0000@localhost:5432/secret-database-00',
    key = '0000';

//pg.defaults.ssl = true;

const distPool = pg.Pool({
    connectionString: distDB
});

fs.readFile(srcFile, "utf8", (error, data) => {
    if (key) {
        data = CryptoJS.DES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
    }
    const tables = JSON.parse(data);

    const isOk = {};
    for (let tKey in tables) {
        isOk[tKey] = [];
        for (let dKey in tables[tKey]) {
            isOk[tKey].push(false);
        }
    }

    for (let tablesKey in tables) {
        for (let dataKey in tables[tablesKey]) {
            let queryParamNames = '', queryParamNumbers = '', queryData = [], i = 1;
            for (let queryKey in tables[tablesKey][dataKey]) {
                queryParamNames += `${queryKey}, `;
                queryParamNumbers += `$${i}, `;
                i++;
                queryData = [...queryData, tables[tablesKey][dataKey][queryKey]];
            }
            queryParamNames = queryParamNames.substring(0, queryParamNames.length - 2);
            queryParamNumbers = queryParamNumbers.substring(0, queryParamNumbers.length - 2);

            distPool.query(`INSERT INTO ${tablesKey}(${queryParamNames}) VALUES(${queryParamNumbers})`, queryData,(error, data) => {
                console.log(error);

                isOk[tablesKey][dataKey] = true;

                let isEnd = true;
                for (let tKey in isOk) {
                    for (let dKey in isOk[tKey]) {
                        if (!isOk[tKey][dKey]) isEnd = false;
                    }
                }

                if (isEnd) {
                    distPool.end();
                    console.log("Finished!!!");
                }
            });
        }
    }
});