import React from 'react';
import Spinner from './spinner.js';

function isEmptyObject( obj ) {
    for ( var name in obj ) {
        return false;
    }
    return true;
};

var ResultsForm = React.createClass({

  componentDidMount: function() {
    if (!this.props.analyze) {
      if (!isEmptyObject(this.props.resultsState)) {
        this.plotData(this.props.resultsState['result0'],
                      this.props.resultsState['result1'],
                      this.props.resultsState['result2'],
                      this.props.resultsState['result3']);
      } 
    }
    else {
      if (!this.props.useCache) {
        if (typeof this.props.fileToUpload != "undefined") {
          this.uploadFile(this.props.fileToUpload);
        }
      } else {
        this.getMetrics();
      }
    }
  },

  plotData: function(result0, result1, result2, result3) {
      var trace1 = {
        x: result0['cpuData'].x,
        y: result0['cpuData'].y,
        type: 'scatter',
        name: result0['cpuCores'] + ' CPU Cores'
      };
      var trace2 = {
        x: result1['cpuData'].x,
        y: result1['cpuData'].y,
        type: 'scatter',
        name: result1['cpuCores'] + ' CPU Cores'
      };
      var trace3 = {
        x: result2['cpuData'].x,
        y: result2['cpuData'].y,
        type: 'scatter',
        name: result2['cpuCores'] + ' CPU Cores'
      };
      var trace4 = {
        x: result3['cpuData'].x,
        y: result3['cpuData'].y,
        type: 'scatter',
        name: result3['cpuCores'] + ' CPU Cores'
      };
      
      var clayout = {
        title: 'CPU Metrics',
        xaxis: {
          title: 'Samples',
          titlefont: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
        yaxis: {
          title: 'CPU Usage %',
          titlefont: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      };
      var cdata = [ trace1, trace2, trace3, trace4 ];

      var mtrace1 = {
        x: result0['memoryData'].x,
        y: result0['memoryData'].y,
        type: 'scatter',
        name: result0['cpuCores'] + ' CPU Cores'
      };
      var mtrace2 = {
        x: result1['memoryData'].x,
        y: result1['memoryData'].y,
        type: 'scatter',
        name: result1['cpuCores'] + ' CPU Cores'
      };
      var mtrace3 = {
        x: result2['memoryData'].x,
        y: result2['memoryData'].y,
        type: 'scatter',
        name: result2['cpuCores'] + ' CPU Cores'
      };
      var mtrace4 = {
        x: result3['memoryData'].x,
        y: result3['memoryData'].y,
        type: 'scatter',
        name: result3['cpuCores'] + ' CPU Cores'
      };
      var mlayout = {
        title: 'Memory Metrics',
        xaxis: {
          title: 'Samples',
          titlefont: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
        yaxis: {
          title: 'Memory Usage MB',
          titlefont: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      };

      var mdata = [ mtrace1, mtrace2, mtrace3, mtrace4 ];

      var utrace1 = {
        x: result0['udpPacketsSent'].x,
        y: result0['udpPacketsSent'].y,
        type: 'scatter',
        name: 'UDP Packets Sent'
      };
      var utrace2 = {
        x: result0['udpPacketsRcvd'].x,
        y: result0['udpPacketsRcvd'].y,
        type: 'scatter',
        name: 'UDP Packets Rcvd'
      };
      var ttrace1 = {
        x: result0['tcpPacketsSent'].x,
        y: result0['tcpPacketsSent'].y,
        type: 'scatter',
        name: 'TCP Packets Sent'
      };
      var ttrace2 = {
        x: result0['tcpPacketsRcvd'].x,
        y: result0['tcpPacketsRcvd'].y,
        type: 'scatter',
        name: 'TCP Packets Rcvd'
      };

      var ndata = [ utrace1, utrace2, ttrace1, ttrace2 ];
      var nlayout = {
        title: 'Network Metrics',
        xaxis: {
          title: 'Samples',
          titlefont: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
        yaxis: {
          title: 'Packets Sent/Rcvd',
          titlefont: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      };

      // Calculate the correct container placement which results in a CPU usage of
      // less than 70%
      var cpuCoresRequired;
      var meanCpu;
      var meanMemory;
      if (result0['meanCpu'] < 70.0) {
        cpuCoresRequired = trace1.name;
        meanCpu = result0['meanCpu'];
        meanMemory = result0['meanMemory'];
      }
      else if (result1['meanCpu'] < 70.0) {
        cpuCoresRequired = trace2.name;
        meanCpu = result1['meanCpu'];
        meanMemory = result1['meanMemory'];
      }
      else if (result2['meanCpu'] < 70.0) {
        cpuCoresRequired = trace3.name;
        meanCpu = result2['meanCpu'];
        meanMemory = result2['meanMemory'];
      }
      else if (result3['meanCpu'] < 70.0) {
        cpuCoresRequired = trace4.name;
        meanCpu = result3['meanCpu'];
        meanMemory = result3['meanMemory'];
      }

      this.refs.resultsCanvas.innerHTML = "<h4>Recommended Container Placement:</h4><em>" + cpuCoresRequired + "<br>\
                                     This will result in a mean CPU usage of about: " + meanCpu.toFixed(2) + "%<br>" +
                                     "Mean Memory Usage: " + meanMemory.toFixed(1)/1000000.0 + "M</em>";
      this.refs.textCanvas.innerHTML = "";

      Plotly.plot( this.refs.cpuCanvas, cdata, clayout, { margin: { t: 0 } } );
      Plotly.plot( this.refs.memoryCanvas, mdata, mlayout, { margin: { t: 0 } } );
      Plotly.plot( this.refs.networkCanvas, ndata, nlayout, { margin: { t: 0 } } );
  },

  getMetrics: function() {
      this.refs.textCanvas.innerHTML = "<h4>Analyzing Application...</h4>";

      var opts = {
        lines: 13 // The number of lines to draw
      , length: 28 // The length of each line
      , width: 14 // The line thickness
      , radius: 42 // The radius of the inner circle
      , scale: 1 // Scales overall size of the spinner
      , corners: 1 // Corner roundness (0..1)
      , color: '#000' // #rgb or #rrggbb or array of colors
      , opacity: 0.25 // Opacity of the lines
      , rotate: 0 // The rotation offset
      , direction: 1 // 1: clockwise, -1: counterclockwise
      , speed: 1 // Rounds per second
      , trail: 60 // Afterglow percentage
      , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
      , zIndex: 2e9 // The z-index (defaults to 2000000000)
      , className: 'spinner' // The CSS class to assign to the spinner
      , top: '50%' // Top position relative to parent
      , left: '50%' // Left position relative to parent
      , shadow: false // Whether to render a shadow
      , hwaccel: false // Whether to use hardware acceleration
      , position: 'absolute' // Element positioning
      }
      var spinner = new Spinner(opts).spin(this.refs.spinner);
      this.refs.spinner.appendChild(spinner.el)
      var appPackage = this.props.fileToUpload[0].name;

      $.ajax({
        url: "http://localhost:3000/api/analytics",
        dataType: 'json',
        type: 'POST',
        context: this,
        data: {appPackage: appPackage,
               appCommand: this.props.appCommand,
               testCommand: this.props.testCommand,
               useCache: this.props.useCache,
               debugMode: this.props.debugMode},
        success: function(data) {
          spinner.stop();

          var result0 = JSON.parse(data[0]);
          var result1 = JSON.parse(data[1]);
          var result2 = JSON.parse(data[2]);
          var result3 = JSON.parse(data[3]);
          this.plotData(result0, result1, result2, result3);
          this.props.resultsStateFunction({
            'result0': result0, 
            'result1': result1,
            'result2': result2,
            'result3': result3
          });
        }.bind(this),
        error: function(xhr, status, err) {
          spinner.stop();
        }.bind(this)
    });
  },

  uploadFile: function(blobFile) {
      var opts = {
          lines: 13 // The number of lines to draw
        , length: 28 // The length of each line
        , width: 14 // The line thickness
        , radius: 42 // The radius of the inner circle
        , scale: 1 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#000' // #rgb or #rrggbb or array of colors
        , opacity: 0.25 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 60 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '50%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'absolute' // Element positioning
      };

      var fd = new FormData();
      fd.append("fileToUpload", blobFile[0]);
      this.refs.textCanvas.innerHTML = "<h4>Uploading File...</h4>";

      var spinner = new Spinner(opts).spin(this.refs.spinner);
      this.refs.spinner.appendChild(spinner.el);

      $.ajax({
         url: "http://localhost:3000/upload",
         type: "POST",
         data: fd,
         processData: false,
         contentType: false,
         context: this,
         cache: false,
         success: function(response) {
             spinner.stop();
             this.getMetrics();
         },
         error: function(jqXHR, textStatus, errorMessage) {
             this.refs.textCanvas.innerHTML = "<h4>Uploading File Failed:" + errorMessage + "</h4>";
         }
      });
  },

  render: function() {
    var canvasStyle = {
      width: "auto"
    };

    var textCanvasStyle = {
      float: "left",
      width: "50%",
      height: "200px"
    };

    var resultsCanvasStyle = {
      float: "left",
      width: "50%",
      height: "200px"
    };

    var spinnerStyle = {
      width: "auto"
    };

    var cpuCanvasStyle = {
      marginTop: "20px",
      width: "auto",
      height:"500px"
    };

    var memoryCanvasStyle = {
      marginTop: "20px",
      width:"auto",
      height:"500px"
    };

    var networkCanvasStyle = {
      marginTop: "20px",
      width:"auto",
      height:"500px"
    };

    return (
        <div id="canvas" style={canvasStyle}>
          <div style={textCanvasStyle} ref="textCanvas"> </div>
          <div style={resultsCanvasStyle} ref="resultsCanvas"> </div>
          <div style={spinnerStyle} ref="spinner"> </div>
          <div style={cpuCanvasStyle} ref="cpuCanvas"> </div>
          <div style={memoryCanvasStyle} ref="memoryCanvas"> </div>
          <div style={networkCanvasStyle} ref="networkCanvas"> </div>
        </div>
    );
  }
});

export default ResultsForm;