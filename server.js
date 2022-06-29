const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser')
const parse = require('csv').parse
const mysql = require('mysql')
const pgp = require('pg-promise')(/* options */)

const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const app = express();
const port = 5000;

require('dotenv').config();
const db = pgp('postgres://uname:password@localhost:5432/postgis')

app.use(bodyParser.json())
app.use(express.static('public'))
app.use(cors());

app.options("*", cors());

app.get("/provinces", (req, res) => {
  let raw = fs.readFileSync(
    "./data/limits_IT_provinces.geojson"
  );
  let geojson = JSON.parse(raw);
  let properties = geojson.features.map((p) => p.properties);

  return res.send(properties);
});

app.get("/provinces/:prov_istat_code_num", (req, res) => {
  let geojson = fs.readFileSync(
    "/data/limits_IT_provinces.geojson"
  );
  let featureCollection = JSON.parse(geojson);
  let prov_istat_code_num = req.params.prov_istat_code_num
  let feature = featureCollection.features.filter(function (feature) {
    return feature.properties.prov_istat_code_num === parseInt(prov_istat_code_num);
  });

  province = {};
  province.type = "FeatureCollection";
  province.bbox = [
    6.62662136853768, 35.493691935511417, 18.52038159909892, 47.091783746462159,
  ];
  province.features = feature;

  return res.send(province);
});


app.get('/geo', (req, res) => {

  let rawdata = fs.readFileSync('./data/earthquakes.geojson');
  let geo = JSON.parse(rawdata);
  return res.json(geo)
})

app.get('/postgis', (req, res) => {

  db.one('SELECT geo FROM public.stores', 123)
    .then((data) => {
      //return res.json(data.geo)
      return res.status(200).send(data.geo)
    })
    .catch((error) => {
      console.log('ERROR:', error)
    })
})

app.get('/read', (req, res) => {

  const data = fs.readFileSync('d:/grafana/grafana.csv')
  parse(data, {
    delimiter: ';',
    trim: true
  }, (err, records) => {
    if (err) {
      console.error(err)
      return res.status(400).json({ success: false, message: 'An error occurred' })
    }
    return res.json({ data: records })
  })
})

app.get('/zz', (req, res) => {

  const data = fs.readFileSync('d:/grafana/grafana.csv')
  parse(data, {
    delimiter: ';',
    trim: true
  }, (err, records) => {
    if (err) {
      console.error(err)
      return res.status(400).json({ success: false, message: 'An error occurred' })
    }
    return res.json({ data: records })
  })
})

app.get('/planets', (req, res) => {


  const MongoClient = require('mongodb').MongoClient

  MongoClient.connect(process.env.MONGO_HOST, (err, client) => {
    if (err) throw err

    const db = client.db('grafana')

    db.collection('planets').find({ "name": "Mercury" }).toArray((err, result) => {
      if (err) throw err

      return res.json(result);
    })
  })

})

app.get('/nodes', (req, res) => {


  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })

  connection.connect()

  connection.query('CALL nodes()', (err, rows, fields) => {
    if (err) throw err
    console.log(rows)
    return res.json(rows[0])
  })

  connection.end()
})

app.get('/edges', (req, res) => {


  const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })

  connection.connect()

  connection.query('SELECT * FROM edges n', (err, rows, fields) => {
    if (err) throw err

    return res.json(rows)
  })

  connection.end()
})

app.get('/', (req, res) => {

  const json = {
    "nodes": [
      {
        "id": 1,
        "title": "nginx",
        "mainStat": 21233,
        "arc__passed": 0.283,
        "passed_color": "green",
        "arc__failed": 0.717,
        "failed_color": "red",
      },
      {
        "id": 2,
        "title": "serviceA",
        "mainStat": 12000,
        "arc__passed": 0.167,
        "passed_color": "green",
        "arc__failed": 0.833,
        "failed_color": "red"
      },
      {
        "id": 3,
        "title": "serviceB",
        "mainStat": 8233,
        "arc__passed": 0.486,
        "passed_color": "green",
        "arc__failed": 0.514,
        "failed_color": "red"
      }
    ],
    "edges": {
      "id": "a",
      "source": 1,
      "target": 2
    }
  };
  return res.json(json)

})

app.get("/hosts", async (req, res) => {
  //https://docs-api.centreon.com/api/centreon-web/
  a = await authenticate();
  const headers = { 'X-AUTH-TOKEN': a.authToken };

  try {
    hostsurl = process.env.CENTREON_URL_PREFIX + process.env.CENTREON_VERSION + '/monitoring/hosts'
    const response = await fetch(hostsurl, {
      method: 'GET',
      headers: headers
    });

    const data = await response.json()
    return res.json(data);
  } catch (e) {
    throw e.response ? e.response.body.message : e;
  }


});

async function authenticate() {
  const form = new FormData();
  form.append("username", process.env.CENTREON_USERNAME);
  form.append('password', process.env.CENTREON_PASSWORD);


  try {
    const url = process.env.CENTREON_URL_PREFIX + 'index.php?action=authenticate';
    const response = await fetch(url, { method: 'POST', body: form });
    const data = await response.json()
    return data;
  } catch (e) {
    throw e.response ? e.response.body.message : e;
  }
}
app.get('/stream', (req, res) => {


  const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })

  connection.connect()

  connection.query('SELECT * FROM edges n', (err, rows, fields) => {
    if (err) throw err

    return res.json(rows)
  })

  connection.end()
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
