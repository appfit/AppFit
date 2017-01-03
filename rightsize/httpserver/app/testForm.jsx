import React from 'react';

var ProtocolAttr = React.createClass({
  getInitialState: function() {
    return {};
  },

  render: function() {
    var restInputStyle = {
        fontSize: "16pt",
        paddingTop: 0,
        paddingLeft: 0,
        height: 420,
        width: 400
    };

    if (this.props.proto === "REST/SOAP") {
      return (
        <div>
          <div className="select" >
            <span className="arr"></span>
            <select>
              <option defaultValue>POST</option>
              <option>GET</option>
            </select>
          </div>
          <br />
          <label><h4>XML Content</h4></label>
          <br />
          <textArea style={restInputStyle} />
        </div>
        );
    } else if ((this.props.proto === "TCP") || (this.props.proto === "UDP")) {
      return (
          <div>
            <label>Port Number</label>
            <input type="text" />
          </div>
        );
    } else {
      return null;
    }
  }
});

var ProtocolSliders = React.createClass({
  getInitialState: function() {
    return {
      points: 5,
      burstRate: 50,
      burstDuration: 500,
      packetSize: 32000,
      pageHits: 5000,
      threads: 4,
    };
  },

  handleBurstRateChange (e) {
    this.setState({"burstRate": e.target.value});
  },

  handleBurstDurationChange (e) {
    this.setState({"burstDuration": e.target.value});
  },

  handlePacketSizeChange (e) {
    this.setState({"packetSize": e.target.value});
  },

  handleThreadsChange (e) {
    this.setState({"threads": e.target.value});
  },

  handlePageHitsChange (e) {
    this.setState({"pageHits": e.target.value});
  },

  render: function() {
    var slidersStyle = {
      float: "left",
      width: "50%",
      marginTop: 40
    };

    var labelStyle = {
      paddingRight: 10
    };

    if ((this.props.proto === "TCP") || (this.props.proto ==+ "UDP")) {
      return (
          <div name="sliders" style={slidersStyle} >
            <label style={labelStyle} title={this.state.points}>Burst Rate ({this.state.burstRate} packets/second) </label>
            <input type="range" name="burstRate" id="burstRate" min="10" max="100" onChange={this.handleBurstRateChange} />
            <label style={labelStyle} title={this.state.points}>Burst Duration ({this.state.burstDuration} seconds) </label>
            <input type="range" name="packetSize" id="packetSize" min="1" max="1000" onChange={this.handleBurstDurationChange} />
            <label style={labelStyle} title={this.state.points}>Packet Size ({this.state.packetSize} bytes) </label>
            <input type="range" name="burstRate" id="burstRate" min="100" max="64000" onChange={this.handlePacketSizeChange} />
            <label style={labelStyle} title={this.state.points}>Threads ({this.state.threads})</label>
            <input type="range" name="threads" id="threads" min="1" max="8" onChange={this.handleThreadsChange} />
          </div>
          );
    } else if ((this.props.proto === "HTTP") || (this.props.proto  === "HTTPS") || (this.props.proto === "REST/SOAP")) {
      return (
          <div name="sliders" style={slidersStyle} >
            <label style={labelStyle} title={this.state.points}>Page Hits/second ({this.state.pageHits} hits/second) </label>
            <input type="range" name="pageHits" id="pageHits" min="10" max="10000" onChange={this.handlePageHitsChange} />
            <label style={labelStyle} title={this.state.points}>Threads ({this.state.threads})</label>
            <input type="range" name="threads" id="threads" min="1" max="8" onChange={this.handleThreadsChange} />
          </div>
          );

    } else {
      return null;
    }
  }
});

var TestForm = React.createClass({
  getInitialState: function() {
      return {
        proto: "None"
      };
  },

  handleProtoChange (e) {
    this.setState({"proto": e.target.value});
  },

  render: function() {
    var protoPanelStyle = {
      float: "left",
      width: "50%",
      marginTop: 40
    };

    var radioButtonStyle = {
      marginBottom: 100
    };

    var protocolAttrStyle = {
      marginTop: 60
    };

    return (
      <div>
        <div name="protoPanel" style={protoPanelStyle} >
            <div className="select" >
              <span className="arr"></span>
              <select onChange={this.handleProtoChange} >
                <option defaultValue>None</option>
                <option>TCP</option>
                <option>UDP</option>
                <option>HTTP</option>
                <option>HTTPS</option>
                <option>REST/SOAP</option>
              </select>
            </div>
            <div name="protocolAttr" style={protocolAttrStyle} >
              <ProtocolAttr proto={this.state.proto} />
            </div>
        </div>
        <ProtocolSliders proto={this.state.proto} />
      </div>
      );
  }
});

export default TestForm;