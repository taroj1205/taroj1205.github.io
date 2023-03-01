from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import pykakasi
from passlib.hash import bcrypt_sha256
import pytz
from datetime import datetime

app = Flask(__name__)
CORS(app)
kks = pykakasi.kakasi()

def makeDataDir():
    # Create the data directory if it doesn't exist
    if not os.path.exists("data"):
        os.makedirs("data")
        print("Created data directory!")

makeDataDir()

@app.route('/submit', methods=['POST'])
def submit_data():
    username = request.form.get('username')
    en = request.form.get('en')
    ja = request.form.get('ja')
    csv_name = request.form.get('csvName')

    if not username or not en or not ja or not csv_name:
        return "Error: Missing data in the request"

    makeDataDir()
    conn = sqlite3.connect(f"data/{username}/{csv_name}/history.db")
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS data (english, 日本語)")
    c.execute("INSERT INTO data VALUES (?, ?)", (en, ja))
    conn.commit()
    conn.close()

    return "Data submitted successfully"

@app.route('/data', methods=['POST'])
def get_data():
    data = request.get_json()
    username = str(data['username'])
    csvName = str(data['csvName'])
    if not username or not csvName:
        return jsonify({'error': 'Missing username or csvName parameter in request'}), 400
    makeDataDir()
    dataPath = f"data/{username}/{csvName}/history.db"
    if os.path.exists(dataPath):
        conn = sqlite3.connect(dataPath)
        c = conn.cursor()
        c.execute("SELECT * FROM data")
        data = c.fetchall()
        conn.close()
        return jsonify([{'english': item[0], 'japanese': item[1]} for item in data])
    else:
        if not os.path.exists(f"data/{username}/{csvName}"):
            os.makedirs(f"data/{username}/{csvName}")
        conn = sqlite3.connect(dataPath)
        c = conn.cursor()
        c.execute("CREATE TABLE IF NOT EXISTS data (english, 日本語)")
        data = c.fetchall()
        conn.close()
        return jsonify([{'english': item[0], '日本語': item[1]} for item in data])

@app.route("/check", methods=["POST"])
def check():
    username = request.form["username"]
    password = request.form["password"]
    makeDataDir()
    conn = sqlite3.connect("data/username.db")
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS data (username TEXT, password_hash TEXT, time TEXT)")
    c.execute("SELECT * FROM data")
    existing_data = c.fetchall()
    for data in existing_data:
        if data[0] == username and bcrypt_sha256.verify(password, data[1]):
            if data[2] is None or data[2] == "NULL":
                timezone = pytz.timezone('Pacific/Auckland')
                current_time = datetime.now(timezone).strftime('%Y-%m-%d %H:%M:%S')
                c.execute("UPDATE data SET time=? WHERE username=?", (current_time, username))
                conn.commit()
            conn.close()
            return "valid"
        elif data[0] == username:
            conn.close()
            return "invalid"
    hashed_password = bcrypt_sha256.hash(str(password))
    timezone = pytz.timezone('Pacific/Auckland')
    current_time = datetime.now(timezone).strftime('%Y-%m-%d %H:%M:%S')
    c.execute("INSERT INTO data VALUES (?,?,?)", (username, hashed_password, current_time))
    conn.commit()
    conn.close()
    print(current_time)
    return "valid"

@app.route("/reset", methods=["POST"])
def reset():
    username = request.form.get("username")
    password = request.form.get("password")
    makeDataDir()
    conn = sqlite3.connect("data/username.db")
    c = conn.cursor()
    c.execute("SELECT * FROM data WHERE username = ?", (username,))
    row = c.fetchone()
    if row is None:
        conn.close()
        return "invalid"
    hashed_password = row[1]
    if bcrypt_sha256.verify(str(password), hashed_password):
        os.remove(f"data/{username}/history.db")
        conn.close()
        return "valid"
    else:
        conn.close()
        return "invalid"

@app.route('/furigana', methods=['POST'])
def getFurigana():
    text = request.form.get("word")
    print("text:",text)
    result = kks.convert(text)
    html = ""
    for item in result:
        if is_kanji(item['orig']):
            html += f"<ruby>{item['orig']}<rt>{item['hira']}</rt></ruby>"
        else:
            html += f"{item['orig']}"
    print(html)
    return jsonify(html)

def is_kanji(string):
    for char in string:
        if 0x4e00 <= ord(char) <= 0x9faf:
            return True
    return False

@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    data = request.get_json()
    csv_name = str(data['csvName'])
    csv_data = data['csvData']
    username = str(data['username'])
    dataPath = f"data/{username}"

    # Create a directory for the CSV if it doesn't exist
    csv_dir = os.path.join(dataPath, csv_name)
    if not os.path.exists(csv_dir):
        os.makedirs(csv_dir)

    # Get the current time in the Pacific/Auckland timezone
    timezone = pytz.timezone('Pacific/Auckland')
    current_time = datetime.now(timezone).strftime('%Y-%m-%d_%H-%M-%S')

    # Rename the old CSV file and save the new CSV data
    csv_path = os.path.join(csv_dir, 'dictionary.csv')
    if os.path.exists(csv_path):
        with open(csv_path, 'r') as f:
            current_data = f.read()
        if current_data == csv_data:
            response = request.form.get('overwrite')
            if response != 'yes':
                return jsonify({'success': False, 'message': 'CSV already exists. Please choose a different name or confirm overwrite.'})
        else:
            os.rename(csv_path, os.path.join(csv_dir, f'dictionary_backup_{current_time}.csv'))

    with open(csv_path, 'w') as f:
        f.write(csv_data)

    return jsonify({'success': True})

@app.route('/listCSVName', methods=['POST'])
def list_csv_names():
    data = request.get_json()
    username = data['username']
    data_path = f"data/{username}"
    if not os.path.exists(data_path):
        return jsonify([]) # return an empty list if user directory doesn't exist
    dir_list = [item for item in os.listdir(data_path) if os.path.isdir(os.path.join(data_path, item))]
    print(dir_list)
    return jsonify(dir_list)

@app.route('/get_csv', methods=['GET'])
def get_csv():
  csv_name = request.args.get('csvName')
  username = request.args.get('username')
  data_path = f"data/{username}/{csv_name}/dictionary.csv"
  with open(data_path, 'r') as f:
    csv_data = f.read()
  response = {
    'csvData': csv_data
  }
  return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)