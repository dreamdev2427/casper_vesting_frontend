const express = require('express')
var cors = require('cors')
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, DeployUtil, CLPublicKey } = require('casper-js-sdk');
const app = express();
const port = 5000;
const node_address = "http://3.208.91.63:7777/rpc";

const client = new CasperClient(node_address);
const contract = new Contracts.Contract(client);
contract.setContractHash("hash-1d512aec2ed0489f2417fb5ef781cf48421b1a663d1bc32fee69e5e19f22ac73");


app.use(express.static(__dirname + '/game'));
app.use(cors());
app.use(express.json());


app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});

app.get('/', (req, res) => {
  res.sendFile('game/index.html', {root: __dirname });
});

app.post('/sendDeploy', (req, res) => {
  const signedJSON = req.body;
  let signedDeploy = DeployUtil.deployFromJson(signedJSON).unwrap(); 
  signedDeploy.send(node_address).then((response) => { 
    res.send(response); 
  }).catch((error) => {
    console.log(error);
    return;
  });
});

app.get("/getDeploy", (req, res) => {
  const hash = req.query.hash;
  client.getDeploy(hash).then((response) => { 
    res.send(response[1].execution_results); 
    return;
  }).catch((error) => {
    res.send(error);
    return;
  })
});

app.get("/getTopscore", (req, res) => {
  const hash = req.query.hash;
  console.log(hash);
  console.log(CLPublicKey.fromHex(hash).toAccountHashStr());
  contract.queryContractDictionary("topscore_dictionary", CLPublicKey.fromHex(hash).toAccountHashStr().substring(13)).then((response) => { 
    res.send(response.data);
    return;
  }).catch((error) => {
    res.send(error);
    return;
  })
});
