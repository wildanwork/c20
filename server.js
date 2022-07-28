const http = require ('http')
const fs = require('fs')
const content = fs.readFileSync('index.html','utf-8')

http.createServer(function(req,res){
    res.writeHead(200,{"content-type": "text/html"})
    res.end(content)
}).listen(3000)