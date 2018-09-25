from flask import Flask, request, render_template, abort
import numpy as np
import json

app = Flask(__name__)
sensorDict = {}


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')


@app.route('/status', methods=['GET'])
def status():
    return json.dumps(list(sensorDict.keys()))


@app.route('/id/<sensorID>', methods=['GET'])
def sensor(sensorID):
    if sensorDict.__contains__(sensorID):
        raw = sensorDict[sensorID]
        data = np.asarray(raw)
        target_trans = np.absolute(np.fft.fft(data))
        target_list = target_trans[0:len(target_trans) // 2]
        target_list = np.log10(target_list)
        return json.dumps({
            'raw': raw,
            'fft': target_list.tolist()
        })
    else:
        abort(404)


@app.route('/classify', methods=['POST'])
def classify():
    who = request.headers["who"]
    # if who!="192.168.88.102":
    #     return "success"
    res = request.data.decode().split()
    data = []
    for line in res:
        data.append(int(line))
    i = who.split('.')[-1]
    # print(i)
    # print(len(data))
    sensorDict[i] = data
    # print(json.dumps(sensorDict))
    return "success"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
