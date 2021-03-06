function getData(n) {
    var arr = [],
        i;
    if (n.length === 0)
        return arr;
    for (i = 1; i < n.length; i++) {
        arr.push([
            i,
            n[i]
        ]);
    }
    return arr;
}

function updateWaterfall(d, w) {
    if (d.length == 0)
        return;
    var now;
    if (w.length == 0) {
        now = -3;
    } else {
        now = w[w.length - 1][1] - 3;
    }
    let max = Math.log(d.length);
    for (var i = 0; i < 250; i = i + 1) {
        let a = Math.floor(Math.exp(i * max / 250))
        let b = Math.exp(i * max / 250) - a;
        let c = (1 - b) * d[a - 1][1] + b * d[a][1];
        w.push([i * 3, now, c]);
    }
    for (var i = 0; i < w.length; i = i + 1) {
        w[i][1] += 3;
    }
    if (w[0][1] > 300) {
        w.splice(0, 250);
    }
    return;
}

function updateChart() {
    $.ajax({
        url: '/id/' + currentID,
        type: 'GET',
        dataType: 'json',
        timeout: 2000,
        success: function (rtn) {
            // console.log(rtn);
            console.time("line");
            data = getData(rtn["raw"]);
            spectrum = getData(rtn["fft"]);
            updateWaterfall(spectrum, water);
            rawChart.update({
                series: [{
                    data: data,
                    lineWidth: 0.5
                }]
            });
            fftChart.update({
                series: [{
                    data: spectrum,
                    lineWidth: 0.5
                }]
            });
            // waterfallChart.update({
            //     yAxis: {
            //         min: water[water.length - 1][1] - 30,
            //         max: water[water.length - 1][1],
            //     },
            //     series: [{
            //         data: water,
            //         boostThreshold: 100,
            //         borderWidth: 0,
            //         nullColor: '#EFEFEF',
            //         colsize: 1, // one day
            //         turboThreshold: Number.MAX_VALUE // #3404, remove after 4.0.5 release
            //     }]
            // });
            updateCanvas();
            console.timeEnd("line");
            up = setTimeout(updateChart, 1000);
        },
        cache: false
    });
}

var n = 5000, data = [], spectrum = [], water, currentID = 0, up, heat;
let rawChart, fftChart;


$(document).ready(function () {
    // data = getData(n);
    // spectrum = getData(n);
    water = [];
    updateWaterfall(spectrum, water);
    heat = simpleheat('canvas');
    heat.radius(2, 2);
    heat.max(5.5);

    rawChart = Highcharts.chart('container', {

        chart: {
            zoomType: 'x',
            marginLeft: 40,
            marginRight: 0,
            height: 400
        },

        title: {
            text: null
        },

        xAxis: {
            minPadding: 0,
            maxPadding: 0
        },

        credits: {
            enabled: false
        },

        tooltip: {
            valueDecimals: 2
        },

        legend: {
            enabled: false
        },

        series: [{
            data: data,
            lineWidth: 0.5
        }]

    });
    fftChart = Highcharts.chart('container2', {

        chart: {
            zoomType: 'x',
            height: 400,
            marginLeft: 40,
            marginRight: 0,
        },

        title: {
            text: null
        },

        credits: {
            enabled: false
        },

        tooltip: {
            valueDecimals: 2
        },

        xAxis: {
            type: 'logarithmic',
            minPadding: 0,
            maxPadding: 0
        },

        legend: {
            enabled: false
        },

        series: [{
            data: spectrum,
            lineWidth: 0.5
        }]

    });
    // waterfallChart = Highcharts.chart('waterfall', {
    //     chart: {
    //         type: 'heatmap',
    //         marginLeft: 70,
    //         marginRight: 0,
    //         height: 300
    //     },
    //
    //     boost: {
    //         useGPUTranslations: true
    //     },
    //
    //     title: {
    //         text: null
    //     },
    //
    //     tooltip: {
    //         enabled: false
    //     },
    //
    //     xAxis: {
    //         // min: 1,
    //         // max: 2500,
    //         // // labels: {
    //         // //     enabled: false
    //         // // },
    //         // type: 'logarithmic'
    //     },
    //
    //     yAxis: {
    //         minPadding: 0,
    //         maxPadding: 0,
    //         min: -30,
    //         max: 0,
    //         startOnTick: false,
    //         endOnTick: false,
    //         labels: {
    //             enabled: false
    //         }
    //     },
    //     colorAxis: {
    //         min: 0,
    //         max: null,
    //         stops: [
    //             [0, '#3060cf'],
    //             [0.5, '#fffbbc'],
    //             [0.9, '#c4463a'],
    //             [1, '#c4463a']
    //         ],
    //     },
    //
    //     series: [{
    //         data: water,
    //         boostThreshold: 1,
    //         borderWidth: 0,
    //         nullColor: '#EFEFEF',
    //         colsize: 1, // one day
    //     }]
    //
    // });

    $.ajax({
        url: '/status',
        type: 'GET',
        dataType: 'json',
        timeout: 2000,
        cache: false,
        success: function (rtn) {
            var menuItem = '';
            currentID = rtn[0];
            for (var str of rtn) {
                menuItem += "<li role=\"presentation\">" +
                    "<a onclick=\"updateCurrent($(this).text())\" role=\"menuitem\" tabindex=\"-1\" href=\"#\">" +
                    str +
                    "</a></li>"
            }
            $("#sensors").html(menuItem);
            updateChart();
        }
    });
});

function updateCurrent(c) {
    currentID = c;
    $("#currentID").html(c);
    console.log(c + " is chosen.")
}

function pause(p) {
    console.log(p);
    if (p === 'Pause') {
        clearTimeout(up);
        $("#pause").html('Resume');
    } else {
        up = setTimeout(updateChart, 1000);
        $("#pause").html('Pause');
    }
}

function updateCanvas() {
    heat.clear().data(water).draw();
}