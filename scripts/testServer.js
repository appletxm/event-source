var fs = require('fs')
var path = require('path')
var express = require('express')
var app = express()
var serverConfig = require('../config/envDevelopment')

function getHtmlFile (req) {
  var promise
  var reqPath = path.join(__dirname, '../src' + req.originalUrl)

  // console.info('##1##', req.originalUrl, reqPath)

  promise = new Promise((resolve) => {
    fs.readFile(reqPath, function (err, result) {
      // console.info('##2##', String(result))
      if (err) {
        throw new Error("can't get the file for" + reqPath)
      } else {
        resolve(result)
      }
    })
  })

  return promise
}

function eventSource (req, res) {
  var interval = 0
  var timeStep = 5000
  var index = 0

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  res.write('retry: ' + timeStep + '\n')
  res.write('event: connecttime\n')
  res.write('id: msg' + index + '\n')
  res.write('data: ' + (new Date()) + '\n\n')
  res.write('data: ' + (new Date()) + '\n\n')

  interval = setInterval(function () {
    index++
    res.write('event: connecttime\n')
    res.write('id: msg' + index + '\n')
    res.write('data: ' + (new Date()) + '\n\n')
  }, timeStep)

  req.on('close', function () {
    clearInterval(interval)
  }, false)
}

app.get('/stream', function (req, res) {
  eventSource(req, res)
})

app.get('/', function (req, res, next) {
  req.originalUrl = req.originalUrl + '/index.html' 
  getHtmlFile(req).then((html) => {
    res.set('content-type', 'text/html')
    res.send(html)
    next()
  }).catch((err) => {
    console.error(err)
  })
})

app.get('*.html', function (req, res, next) {
  getHtmlFile(req).then((html) => {
    res.set('content-type', 'text/html')
    res.send(html)
    next()
  }).catch((err) => {
    console.error(err)
  })
})

app.listen(serverConfig['port'], serverConfig['host'], function (arg) {
  var url = 'http://' + serverConfig['host'] + ':' + serverConfig['port']
  console.info('dev server started at: ', url)
})
