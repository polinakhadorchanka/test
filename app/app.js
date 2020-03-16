let express = require("express");
let bodyParser = require('body-parser');
let mod = require('./dbModule');
let parseH = require('./parsehubModule')
let dateFormat = require('dateformat');

let app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
//TODO: доделать, сделать запуск полученных парсеров
    mod.getListOfParsers('launched').then(function (result) {
        result.forEach(function (element) {
            console.log(element);
            workWithParseHub(`${element.ParserKey}`,`${element.ParserToken}`);
        });
    });
});

app.get("/api/vacancies", function(req, res){
    let vacancies;
    let id = req.query.id;
    let filter = req.query.filter;
    let userId = req.query.userId;
    mod.getData(id, filter, userId).then(function(result) {
        res.send(result);
    });
});

// Получение новых вакансий++ TODO: idClient
app.get("/api/vacancies/new", function(req, res){
    let vacancies;
    let id = req.query.id,
        filter = req.query.filter,
        userId = req.query.userId;
    mod.getNewData(id, filter, userId).then(function(result) {
        res.send(result);
    });
});

// Получение количества новых вакансий++ TODO: idClient
app.get("/api/vacancies/new/count", function(req, res){
    let id = req.query.id,
        userId = req.query.userId;
    mod.getAmount(id, userId).then(function(result) {
        res.send(result);
    });
});

// Получение количества оставшихся вакансий++
// Пример вызова `/api/vacancies/next?count=${this.state.nextCount}` , где count - количество отображаемых вакансий
app.get("/api/vacancies/next", function(req, res){
    let filter = req.query.filter;
    let id = req.query.id;
    let userId = req.query.userId;
    mod.getAmountLeft(id, filter,userId).then(function(result) {
        res.send(result);
    });
});

//функция изменения статуса записи
app.put("/api/vacancy-status", function (req, res) {
    mod.updateVacancyState(req.body.VacancyId,req.query.userId,+req.body.IsViewed,+req.body.IsRemoved,
        req.body.BoardStatus,req.body.Comment).then(function(result){
        res.send(result);
    });
});

function workWithParseHub(key,token){
    // todo: они уже передаются без ковычек
    let a = setInterval(function () {
        mod.getParserState(`${token}`, `${key}`).then(function (result) {
            if (result == 0) {
                clearInterval(a);
                console.log('разрываю таймер');
            } else {
                parseH.getStateFromParseHub(key, token).then(function (result) {
                    console.log(result);
                    console.log(result.status);
                    console.log(result.pages);
                    if(+(result.pages)==0 && result.status != 'queued'){//++
                        console.log("У нас 0 страниц перезапустим ка мы пармер");
                        //parseH.runParseHubFunction(key, token);
                    } else if(result.status == 'queued' || result.status == 'initialized' || result.status == 'running')//++
                        return;
                    else if((result.status == 'cancelled' || result.status == 'complete') && +(result.pages)>0){
                        mod.getLastNoteDate().then(function (resultD) {
                            mod.getParserDate(token,key).then(function (resultP) {
                                result.end_time = result.end_time.substr(0, 10);
                                let a = new Date();
                                let b = dateFormat(a,"isoDate");
                                if(Date.parse(result.end_time) < Date.parse(b)) {// дата поселеднего парсинга меньше сегодня => запустить парсер ++
                                    //parseH.runParseHubFunction(key, token);
                                    console.log(result.status + " " + "Надо бы запустить парсерочек");
                                } else { //тут пишем код если данные сегодняшние(актуальные)
                                    if(resultP.ParserLastReadBdDate == null || Date.parse(resultP.ParserLastReadBdDate) //если дата последней считки is null или меньше сегодня считываем и обновляем дату на сегодня
                                        < Date.parse(b)){
                                        /* parseH.getDataFromParseHub(key, token).then(function (result) {
                                             mod.updateParserDate(token,key).then(function (result) {
                                                 mod.insertVacations(JSON.stringify(result));
                                             });
                                         });*/
                                        console.log('надо считать данные для их актуализации записать сегодняшнюю дату в парсер');
                                    } else {
                                        return;
                                    }
                                }
                            });
                        })
                    }
                })
            }
        })
    },25000);
}

app.get("/vacancies", function(req, res){
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", function(req, res){
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/login", function(req, res) {
    let type = req.body.type,
        login = req.body.login,
        password = req.body.password;

    mod.LogInValidation(login,password).then(function (result) {
        if(result.errorCode == 0){
            res.send(result);
        } else {
            res.send([{errorCode: 3, errorMessage: "Login failed"}]);
        }
    })

});

app.get("/registration", function(req, res){
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/registration", function(req, res){
    console.log(req.body);
    let loginCount = +0,
        emailCount = +0;
    mod.registrationValidationEmail(req.body.email).then(function (resultE) {
        emailCount = resultE;
        mod.registrationValidationLogin(req.body.login).then(function (resultL) {
            loginCount = resultL;
            if(loginCount == 0 && emailCount == 0) {
                res.send([{errorCode: 0}]);
                mod.insertNewClient(req.body.login,req.body.password,req.body.email);
            }
            else if(loginCount > 0 && emailCount == 0)
                res.send([{errorCode: 1, errorMessage: "Reserved login"}]);
            else if(loginCount == 0 && emailCount > 0)
                res.send([{errorCode: 2, errorMessage: "Reserved email"}]);
            else if(loginCount > 0 && emailCount > 0)
                res.send([{errorCode: 1, errorMessage: "Reserved login"},{errorCode: 2, errorMessage: "Reserved email"}]);
        });
    });
});

app.get('/api/parsers',function (req,res) {
    mod.getListOfParsers('all').then(function (result) {
        res.send(result);
    })
});

app.post('/api/parsers',function (req,res) {
    let token = req.body.ParserToken,
        apiKey = req.body.ParserKey,
        state = req.body.ParserState,
        description  = req.body.ParserDescription;
    parseH.getListOfParsersByKey(apiKey).then(function (result) {
        let check = +0;
        result.projects.forEach(function (element) {
            if(element.token == token)
                check++;
        });
        if(check == 0){
            res.send([{errorCode: 5, errorMessage: "Wrong token"}]);
        } else{
            mod.insertNewParser(token, apiKey, state, description).then(function (result) {
                res.send(result);
            });
        }
    }).catch(function(err) {
        console.dir(err);
        res.send([{errorCode: 4, errorMessage: "DB token adding error"}]);
    });
});

app.put('/api/parsers',function (req,res) {
    let parserId = req.body.ParserId,
        state = req.body.ParserState,
        description = req.body.ParserDescription,
        key = req.body.ParserKey,
        token = req.body.ParserToken;
    mod.updateParserState(parserId, state, description).then(function(result){
        let message = result;
        if(state == 1){
            //todo: запустить парсер
            workWithParseHub(`${key}`,`${token}`);
        }
        res.send(message);
    });
});

app.delete('/api/parsers',function (req,res) {
    let parserId = req.body.ParserId;
    mod.deleteParser(parserId).then(function(result){
        let message = result;
        res.send(message);
    });
});

app.get("/*", function(req, res){
    res.sendFile(__dirname + "/public/index.html");
});