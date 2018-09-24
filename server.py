from flask import Flask
from flask import request

app = Flask(__name__)
d = {"192.168.88.101": "X", "192.168.88.104": "Y", "192.168.88.102": "Z"}
speed = {"X": 40, "Y": 60, "Z": 10}


@app.route('/',methods=['GET'])
def home():
    return '<h1>Home</h1>'


@app.route('/status',methods=['GET'])
def status():
    return str(speed["X"])+'\n'+str(speed["Y"])+'\n'+str(speed["Z"])


@app.route('/classify',methods=['POST'])
def classify():
    who = request.headers["who"]
    # if who!="192.168.88.102":
    #     return "success"
    res = request.data.decode().split()
    data = []
    for line in res:
        data.append(int(line))
    print(who)
    print(len(data))
    return "success"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
