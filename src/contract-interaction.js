

const client = new CasperClient("http://3.208.91.63:7777/rpc");
const contract = new Contracts.Contract(client);
var activeKey = null;
var button = document.getElementById("button");
var getDeployInterval = null;
var highscore = null;

if (Signer.isConnected()) {
  button.textContent = "Publish";
}

function sendSign() {
  Signer.sendConnectionRequest();
}

async function createDeploy() {
  if (activeKey == null) {
    alert("Please unlock the signer to continue");
    return;
  }

  if (score == 0) {
    alert("Your score may not be zero");
    return;
  }

  console.log(highscore);

  if (highscore != null && score < highscore) {
    alert("Your score may not be less than your highscore");
    return;
  }

  const args = RuntimeArgs.fromMap({ 'score': CLValueBuilder.u512(score) });
  const pubkey = CLPublicKey.fromHex(activeKey);
  contract.setContractHash("hash-1d512aec2ed0489f2417fb5ef781cf48421b1a663d1bc32fee69e5e19f22ac73");
  const result = contract.callEntrypoint("top_score", args, pubkey, "casper-test", csprToMotes(1).toString(), [], 10000000);
  const deployJSON = DeployUtil.deployToJson(result);
  Signer.sign(deployJSON, activeKey).then((success) => {
    sendDeploy(success);
  }).catch((error) => {
    console.log(error);
  });
}

function sendDeploy(signedDeployJSON) {
  axios.post("/sendDeploy", signedDeployJSON, { 
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    const hash = response.data;
    updateStatus("Deployed. <a target='_blank' href='https://testnet.cspr.live/deploy/" + hash + "'>View on cspr.live</a>");
    initiateGetDeployProcedure(hash);
  }).catch((error) => {
    alert(error);
  });
}

function initiateGetDeployProcedure(hash) {
  animateStatusByAppending("Waiting for execution");
  getDeploy(hash);
  getDeployInterval = setInterval(() => {
    getDeploy(hash);
  }, 5000);
}

async function getDeploy(deployHash) {
  axios.get("/getDeploy", {
    params: {
      hash: deployHash,
    }
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (response.data.length == 0) { 
      console.log("No return data yet");
      return;
    }

    const executionResults = response.data[0];

    if (!executionResults.hasOwnProperty("result")) { 
      console.log("Doesnt have result yet");
      return;
    }

    const result = executionResults.result; 
    console.log(response.data);

    if (result.hasOwnProperty("Success")) { 
      console.log("Success!");
      stopAnimation("Deployment Successful", "#2A9944");
      getHighscore(activeKey);
      console.log("Execution Successful")
    } else if (result.hasOwnProperty("Failure")) {
      stopAnimation("Deployment Failure: " + result.Failure.error_message, "#F50102");
      console.log("Execution Failure");
    } else {
      stopAnimation("Unknown Error, result not containing Success or Failure", "#F50102");
      console.log("Unknown Error");
    }
    clearInterval(getDeployInterval); 

  }).catch((error) => {
    alert(error);
    stopAnimation("Error deploying", "#CF000F");
    clearInterval(getDeployInterval); 
  });
}

async function getHighscore(pubkey) {
  axios.get("/getHighscore", { 
    params: {
      hash: pubkey,
    }
  }).then((response) => {
    setHighscore(parseInt(response.data.hex, 16));
  }).catch((error) => {
    alert("Could not get highscore");
  });
}

async function buttonPressed() {
  const isConnected = await Signer.isConnected();
  if (isConnected) {
    if (activeKey == null) {
      try {
        activeKey = await Signer.getActivePublicKey();
      } catch (error) {
        alert(error);
      }
      setActiveKeyLabel(activeKey);
      button.textContent = "Publish";
    } else {
      createDeploy();
    }

  } else {
    sendSign();
  }
}
window.addEventListener("signer:locked", (msg) => {
  setActiveKeyLabel("Not Connected");
  activeKey = null;
});
window.addEventListener("signer:unlocked", (msg) => {
  if (msg.detail.isConnected) {
    recentlyConnected(msg.detail.activeKey);
    button.textContent = "Publish";
  }
});
window.addEventListener("signer:activeKeyChanged", (msg) => {
  if (msg.detail.isConnected) {
    recentlyConnected(msg.detail.activeKey);
  }
});
window.addEventListener("signer:connected", (msg) => {
  recentlyConnected(msg.detail.activeKey);
  button.textContent = "Publish";
});
window.addEventListener("signer:disconnected", (msg) => {
  setActiveKeyLabel("Not Connected");
  activeKey = null;
  button.textContent = "Connect";
});

function recentlyConnected(pubkey) {
  activeKey = pubkey;
  setActiveKeyLabel(pubkey);
  getHighscore(pubkey);
}


function setActiveKeyLabel(address) {
  document.getElementById("connected-account").textContent = "Connected Account: " + address;
}

function csprToMotes(cspr) {
  return cspr * 10**9;
}
