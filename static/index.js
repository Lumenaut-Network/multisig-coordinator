var transactions = [];
var handled = false;

const phrase = "Lumenaut"

function update_info() {
	document.getElementById("info-box").style = "display: block";

	var num_transactions = document.getElementById("num-transactions");
	var cur_signatures = document.getElementById("current-signatures");
	num_transactions.innerHTML = "Number of transactions: " + transactions.length;

	var xdr = transactions[0];
	var transaction = new StellarBase.Transaction(xdr);
	cur_signatures.innerHTML = "Number of signatures: " + transaction.signatures.length;
}

function setStyle(id, style) {
	document.getElementById(id).style = style;
}

function showMessage(msg, color) {
	document.getElementById("conf-msg").innerHTML = msg;
	setStyle("conf-msg", "display: block; color: " + color);
	setTimeout(function() {
		setStyle("conf-msg", "display: none");
	}, 2500);
}

function handlePostResponse(res) {
	if (handled) return; handled = true;
	if (res.status == 200) {
		setStyle("sign-box", "display: none");
		setStyle("stat-info", "display: none");

		setStyle("done-confirmation", "display: block; color: rgb(20, 160, 20)")
	} else {
		showMessage("Signing failure: " + res.responseText, "rgb(150, 40, 40)");
	}
}

function sign() {
	var key = document.getElementById("key_input").value;
	var keypair;
	try {
		keypair = StellarBase.Keypair.fromSecret(key);
	} catch(e) {
		showMessage("Invalid signing key", "rgb(150, 40, 40)");
		return;
	}

	var signature = btoa(String.fromCharCode.apply(null, keypair.sign(phrase)));
	StellarBase.Network.usePublicNetwork();

	var signed = [];
	for (var i = transactions.length - 1; i >= 0; i--) {
		var xdr = transactions[i];
		var transaction = new StellarBase.Transaction(xdr);
		transaction.sign(keypair);
		signed.push(transaction.toEnvelope().toXDR("base64"));
	}

	var data = [keypair.publicKey(), signature, signed];
	var _json = JSON.stringify(data);

	var post = new XMLHttpRequest();
	post.open("POST", "/transactions");
	post.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	post.onreadystatechange = function() { 
		if (post.readyState == XMLHttpRequest.DONE) {
			handlePostResponse(post);
		}
	}

	post.send(_json);
}

function openSigner(served_transactions) {
	setStyle("instructions", "display:none");
	setStyle("signer", "display:block");

	transactions = served_transactions;
	update_info();
}

var http = new XMLHttpRequest();
http.open("GET", "/transactions", true);
http.onreadystatechange = function() { 
	if (http.readyState == 4 && http.status == 200)
		openSigner(JSON.parse(http.responseText));
}
http.send();