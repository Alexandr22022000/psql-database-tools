const fs = require('fs');

//fs.writeFile("./data/hello.txt", "Привет МИГ-29!");

/*fs.readFile("hello.txt", "utf8", function(error,data){
    console.log(data);
});*/

const data = {
    aaa: 'AAA',
    bbb: [1, "bbb"]
};

console.log(JSON.stringify(data));