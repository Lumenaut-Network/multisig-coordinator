var transactions = [];
var handled = false;

function handlePostResponse(res) {
	if (handled) return; handled = true;
	if (res == "success") {
		document.getElementById('instructions').style = "display: block";
		document.getElementById('instructions-text').innerHTML = "Signing success!";
		document.getElementById('signer').style = "display: none";
	} else {
		document.getElementById('key-prompt').innerHTML = "Upload failed, try again?";
	}
}

function sign() {
	var key = document.getElementById('key_input').value;
	var signed = [];
	for (var i = transactions.length - 1; i >= 0; i--) {
		var xdr = transactions[i];
		var transaction = new StellarBase.Transaction(xdr);
		var keypair = StellarBase.Keypair.fromSecret(key);
		StellarBase.Network.useTestNetwork();
		transaction.sign(keypair);
		signed.push(transaction.toEnvelope().toXDR("base64"));
	}

	var json_trans = JSON.stringify(transactions);

	var post = new XMLHttpRequest();
	post.open("POST", "/transactions");
	post.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	post.onreadystatechange = function() { 
		if (post.readyState == XMLHttpRequest.DONE) {
			handlePostResponse(post.responseText);
		}
	}
	post.send(json_trans);
}

function openSigner(served_transactions) {
	document.getElementById('instructions').style = "display:none";
	document.getElementById('signer').style = "display:block";
	transactions = served_transactions;
}

var http = new XMLHttpRequest();
http.open("GET", "/transactions", true);
http.onreadystatechange = function() { 
	if (http.readyState == 4 && http.status == 200)
		openSigner(JSON.parse(http.responseText));
}
http.send();