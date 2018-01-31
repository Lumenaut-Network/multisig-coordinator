from flask import Flask, send_file, render_template, request, Response
import json, base64
from stellar_base.keypair import Keypair
from stellar_base.address import Address

app = Flask(__name__)

pool_address = "GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT"
phrase = b"Lumenaut"

pool = Address(address=pool_address, network="public")
pool.get()
pool_signers = [acc["public_key"] for acc in pool.signers if acc["weight"] > 0]

@app.route("/")
def index():
	return render_template("index.html")

# verify base64-encoded string
def verify(pubkey, data):
	if pubkey not in pool_signers:
		return False

	data = bytes(base64.b64decode(data))
	pubkp = Keypair.from_address(pubkey)

	try:
		pubkp.verify(phrase, data)
	except:
		return False
	else:
		return True

def handle_update(data):
	if not verify(data[0], data[1]):
		return ("Unauthorized signature", 401)
	
	with open("transactions.json", 'w') as fp:
		json.dump(data[2], fp)

	return ("Signatures updated", 200)

@app.route("/transactions", methods=["GET", "POST"])
def get_transactions():
	if request.method == "POST":
		return handle_update(request.json)
	else:
		with open("transactions.json", 'r') as json_file:
			transactions_json = json_file.read()

			response = Response(transactions_json, content_type="application/json; charset=utf-8")
			response.headers.add("content-length", len(transactions_json))
			response.headers.add("Pragma", "no-cache")
			response.headers.add("Cache-Control", "no-cache, no-store, must-revalidate")
			response.status_code = 200
			return response

app.run(port=8888)