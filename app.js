const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('bread.db', sqlite3.OPEN_READWRITE, err => {
  if (err) {
    console.log('gagal koneksi dengan database', err)
  }
})
const moment = require('moment')
const { Console } = require('console')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.get('/', (req, res) => {
  const url = req.url == '/' ? "/?page=1" : req.url
  const page = req.query.page || 1
  const LIMIT = 3;
  const OFFSET = (page - 1) * LIMIT
  const wheres = []
  const values = []


  if (req.query.stringCB == 'on' && req.query.string) {
    wheres.push(`_string like '%' || ? || '%' `)
    values.push(req.query.string)
  }
  if (req.query.integerCB == 'on' && req.query.integer) {
    wheres.push('_integer= ? ')
    values.push(req.query.integer)
  }
  if (req.query.floatCB == 'on' && req.query.float) {
    wheres.push('_float= ? ')
    values.push(req.query.float)
  }
  if (req.query.dateCB == 'on' && req.query.datestart && req.query.dateend) {
    wheres.push('_date BETWEEN ? AND ? ')
    values.push(req.query.datestart, req.query.dateend)
  } else if (req.query.dateCB == 'on' && req.query.datestart){
    wheres.push('_date > ? ')
    values.push(req.query.datestart)
  } else if (req.query.dateCB == 'on' && req.query.dateend){
    wheres.push('_date < ? ')
    values.push(req.query.dateend)
  }

  if(req.query.booleanCB == 'on' && req.query.boolean){
    wheres.push('_boolean = ?')
    values.push(req.query.boolean)
  }
  if (req.query.stringCB == 'on' && req.query.string ) {
    wheres.push(`_string like '%' || ? || '%' `)
    values.push(req.query.string)
  }


  let sql = 'SELECT COUNT(*) AS total FROM bread'
  if (wheres.length > 0) {
    sql += ` WHERE ${wheres.join(' and ')}`
  }
  console.log(sql)

  db.all(sql, values, (err, data) => {
    const pages = Math.ceil(data[0].total / LIMIT)

    sql = 'Select * FROM bread '
    if (wheres.length > 0) {
      sql += ` WHERE ${wheres.join(' and ')} `
    }
    sql += 'LIMIT  ? OFFSET  ?'
    db.all(sql, [...values, LIMIT, OFFSET], (err, data) => {
      res.render('list', { rows: data, pages, page, moment, url, query: req.query })
    })
    console.log(sql)
  })

})




app.get('/add', (req, res) => {
  res.render('add')
})
app.post('/add', (req, res) => {
  const { string, integer, float, date, boolean } = req.body
  db.run('insert into bread (_string,_integer,_float,_date,_boolean) values (?, ?, ?, ?, ?)', [string, (integer), (float), date, boolean], (err) => {
    if (err)
      console.log('gabisa ambil data', err)
    res.redirect('/')
  })

})

app.get('/delete/:id', (req, res) => {
  const index = req.params.id
  db.run('delete from bread where _id = ?', [index], (err) => {
    if (err)
      console.log('gabisa ambil data', err)
    res.redirect('/')
  })

})
app.get('/edit/:id', (req, res) => {
  db.all('select * from bread where _id = ?', [req.params.id], (err, data) => {
    if (err)
      console.log('gabisa ambil data', err)
    res.render('edit', { item: data[0] })
  })

})
app.post('/edit/:id', (req, res) => {
  const { string,integer,float,date,boolean,id }=req.body
  db.all('Update bread Set _string = ?, _integer = ? , _float = ? , _date = ? , _boolean = ?  where _id = ?',[string,integer,float,date,boolean,id] ,(err, data) => {

    if (err) {
      console.log('gabisa ambil data euy', err)
    }
    res.redirect('/')
  });
 
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})