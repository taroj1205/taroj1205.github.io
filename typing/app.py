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

@app.route('/', methods=['POST'])
def submit_data():
    username = request.form.get('username')
    password = request.form.get('password')
    en = request.form.get('en')
    ja = request.form.get('ja')

    if not username or not en or not ja or not password:
        return "Error: Missing data in the request"

    makeDataDir()
    conn = sqlite3.connect(f"data/{username}/history.db")
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS data (english, 日本語)")
    c.execute("INSERT INTO data VALUES (?, ?)", (en, ja))
    conn.commit()
    conn.close()

    return "Data submitted successfully"

@app.route('/data/<username>', methods=['GET'])
def get_data(username):
    makeDataDir()
    dataPath = f"data/{username}/history.db"
    if os.path.exists(dataPath):
        conn = sqlite3.connect(dataPath)
        c = conn.cursor()
        c.execute("SELECT * FROM data")
        data = c.fetchall()
        conn.close()
        return jsonify([{'english': item[0], 'japanese': item[1]} for item in data])
    else:
        if not os.path.exists(f"data/{username}"):
                os.makedirs(f"data/{username}")
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
    hashed_password = bcrypt_sha256.hash(password)
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
    if bcrypt_sha256.verify(password, hashed_password):
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

if __name__ == "__main__":
    app.run(debug=True)
