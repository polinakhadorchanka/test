const sql = require('mssql');
let fs = require("fs");

const config= {
	user: 'nodejs',
	password: 'nodejs',
	server: 'DBServer1',
	database: 'BORODICH',
	port: 50100
};
//TODO: переделать вес функции под userId
module.exports.getData = async function(id, filter, userId) {
	return new Promise(function(resolve, reject) {
		let usQuery;
		// filter ++
		sql.connect(config).then(function() {
			if(id == 'undefined') {
				usQuery = `select * from testF0('${userId}','${filter}')`;
			} else{
				usQuery = `select * from testF1('${id}','${userId}','${filter}')`
			}
			let obj = new sql.Request().query(usQuery).then(function (result) {
				sql.close(function (err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
						reject("Ошибка: " + err.message);
					}
					resolve(result.recordset);
					console.log("Подключение закрыто");
				});
			}).catch(function (err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};

module.exports.getAmount = async function(id, filter) {
	// filter ++
	return new Promise(function(resolve, reject) {
		let usQuery;
		sql.connect(config).then(function() {
			if(filter == `all`){
				usQuery = `select dbo.testF3 (\'${id}\',\'all\') as count`;
			} else if(filter == `unviewed`) {
				usQuery = `select dbo.testF3 (\'${id}\',\'unviewed\') as count`;
			} else if(filter == `isFavorite`) {
				usQuery = `select dbo.testF3 (\'${id}\',\'favorite\') as count`;
			}
			let obj = new sql.Request().query(usQuery).then(function(result) {
				sql.close(function(err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
						reject("Ошибка: " + err.message);
					}
					resolve(result.recordset);
					console.log("Подключение закрыто");
				});
			}).catch(function(err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};

module.exports.getAmountLeft = async function(vacId,filter,userId) {
	// filter
	return new Promise(function(resolve, reject) {
		sql.connect(config).then(function() {
			let usQuery = `select dbo.testF2 ('${vacId}','${filter}','${userId}') as count`;
			let obj = new sql.Request().query(usQuery).then(function(result) {
				sql.close(function(err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
					}
					resolve(result.recordset);
					console.log("Подключение закрыто");
				});
			}).catch(function(err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};

module.exports.getNewData = async function(id,filter) {
	return new Promise(function(resolve, reject) {
		let usQuery;
		sql.connect(config).then(function() {
			if(filter == `all`){
				usQuery = `select * from testF4(\'${id}\') where isRemoved = 0 order by DBAddingTime DESC, url, position`;
				console.log(usQuery + "usQUery");
			} else if(filter == `unviewed`) {
				usQuery = `select * from testF4(\'${id}\') where isRemoved = 0 and isViewed = 0 order by DBAddingTime DESC, url, position`;
			} else if(filter == `isFavorite`){
				usQuery = `select * from testF4(\'${id}\') where isRemoved = 0 and isFavorite = 1 order by DBAddingTime DESC, url, position`;
			}
			console.log(usQuery + "usQUery");
			let obj = new sql.Request().query(usQuery).then(function(result) {
				sql.close(function(err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
						reject("Ошибка: " + err.message);
					}
					resolve(result.recordset);
					console.log("Подключение закрыто");
				});
			}).catch(function(err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};

module.exports.updateState = async function(vacancyID,clientId,isViewed,isRemoved,boardStatus) {
	return new Promise(function(resolve, reject) {
		sql.connect(config).then(function() {
			let usQuery = `exec updateStateClientVacancy '${clientId}','${vacancyID}',${isViewed},${isRemoved},${boardStatus}`
			let obj = new sql.Request().query(usQuery).then(function() {
				sql.close(function(err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
						reject("Ошибка: " + err.message);
					}
					resolve("Данные успешно обновлены/добавлены.");
					console.log("Подключение закрыто");
				});
			}).catch(function(err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};

module.exports.getLastNoteDate = async function() {
	return new Promise(function(resolve, reject) {
		sql.connect(config).then(function() {
			let usQuery = "select top(1) convert(nvarchar(10),DbAddingDate,126) as DbAddingDate from Vacancy order by DbAddingDate DESC";
			let obj = new sql.Request().query(usQuery).then(function(result) {
				sql.close(function(err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
						reject("Ошибка: " + err.message);
					}
					resolve(result.recordset[0]);
					console.log("Подключение закрыто");
				});
			}).catch(function(err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};

module.exports.insertVacations = function(data) {
	sql.connect(config).then(function() {
		new sql.Request().query(`exec InsertNewVacancy '${data}'`).then(function(recordset) {
			console.dir(recordset);
		}).catch(function(err) {
			console.dir(err);
		});
	}).catch(function(err) {
		console.dir(err);
	});
};

module.exports.registrationValidationLogin = async function(login) {
	return new Promise(function(resolve, reject) {
		sql.connect(config).then(function() {
			let usQueryL = `select count(*) as loginCount from Client where login = '${login}'`;
			let objL = new sql.Request().query(usQueryL).then(function(result) {
				sql.close(function(err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
					}
					resolve(result.recordset[0].loginCount);
					console.log("Подключение закрыто");
				});
			}).catch(function(err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};

module.exports.registrationValidationEmail = async function(email) {
	return new Promise(function(resolve, reject) {
		sql.connect(config).then(function() {
			let usQueryE = `select count(*) as emailCount from Client where email = '${email}'`,
				emailCount = +0;
			let objE = new sql.Request().query(usQueryE).then(function(result) {
				sql.close(function(err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
					}
					resolve(result.recordset[0].emailCount);
					console.log("Подключение закрыто");
				});
			}).catch(function(err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};

module.exports.LogInValidation = async function(login, password) {
	return new Promise(function(resolve, reject) {
		sql.connect(config).then(function() {
			let usQuery = `select * from LogInValidation('${login}','${password}')`;
			let obj = new sql.Request().query(usQuery).then(function(result) {
				sql.close(function(err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
					}
					resolve(result.recordset[0]);
					console.log("Подключение закрыто");
				});
			}).catch(function(err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};

module.exports.insertNewClient = async function(login,password,email) {
	return new Promise(function(resolve, reject) {
		sql.connect(config).then(function() {
			let usQuery = `insert into Client(login,password,email) values('${login}','${password}','${email}')`;
			let obj = new sql.Request().query(usQuery).then(function() {
				sql.close(function(err) {
					if (err) {
						return console.log("Ошибка: " + err.message);
						reject("Ошибка: " + err.message);
					}
					resolve("Клиент успешно добавлен.");
					console.log("Подключение закрыто");
				});
			}).catch(function(err) {
				console.dir(err);
			});
		}).catch(function(err) {
			console.dir(err);
		});
	})
};