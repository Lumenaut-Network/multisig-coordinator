from flask import Flask, send_file, render_template, request, Response
import json
app = Flask(__name__)

@app.route("/")
def hello():
	return render_template("index.html")

def handle_update(transactions):
	print(len(transactions))
	return ("success", 200)

@app.route("/transactions", methods=["GET", "POST"])
def get_transactions():
	if request.method == "POST":
		return handle_update(request.json)
	else:
		with open("../pool/transactions.json", 'r') as json_file:
			transactions_json = json_file.read()

			response = Response(transactions_json, content_type="application/json; charset=utf-8")
			response.headers.add("content-length", len(transactions_json))
			response.headers.add("Pragma", "no-cache")
			response.headers.add("Cache-Control", "no-cache, no-store, must-revalidate")
			response.status_code = 200
			return response

app.run(port=8888)