from flask import Flask, send_file, render_template, request
import json
app = Flask(__name__)

@app.route("/")
def hello():
	return render_template("index.html")

def handle_update(transactions):
	print(len(transactions))
	return ("success", 200)

@app.route("/transactions", methods=['GET', 'POST'])
def get_transactions():
	if request.method == "POST":
		return handle_update(request.json)
	else:
		return send_file("../pool/transactions.json")

app.run(port=8888)