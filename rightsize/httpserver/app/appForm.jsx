import React from 'react';

function isEmptyObject( obj ) {
    for ( var name in obj ) {
        return false;
    }
    return true;
};

var AppForm = React.createClass({
  getInitialState: function() {
    if (isEmptyObject(this.props.appState)) {
      return {
        appCommand: "", 
        testCommand: "",
        useCache: true,
        debugMode: false,
        submitButtonDisabledState: true
      };
    } else {
      return {
        appCommand: this.props.appState.appCommand, 
        testCommand: this.props.appState.testCommand,
        useCache: this.props.appState.useCache,
        debugMode: this.props.appState.debugMode,
        appPackage: this.props.appState.appPackage,
        submitButtonDisabledState: true
      };
    }
  },
  handleAppCommandChange: function(e) {
    this.setState({appCommand: e.target.value});
    this.updateState();
  },
  handleTestCommandChange: function(e) {
    this.setState({testCommand: e.target.value});
    this.updateState();
  },
  handleUseCacheChange: function() {
    this.setState({useCache: !this.state.useCache});
    this.updateState();
  },
  handleDebugModeChange: function() {
    this.updateState();
    this.setState({debugMode: !this.state.debugMode});
  },
  handleSubmit: function() {
    this.props.analyzeFunction(
      this.state.appCommand,
      this.state.testCommand,
      this.state.debugMode,
      this.state.useCache
      );
    this.updateState();
  },
  cacheHit: function(data) {
    this.setState({appCommand: data.appCommand});
    this.setState({testCommand: data.testCommand});
    this.updateState();
  },
  handleAppPackageChange: function(fileToUpload) {
    this.setState({submitButtonDisabledState: false});
    this.setState({appPackage: fileToUpload});
    this.props.fileToUploadFunction(fileToUpload);
    this.updateState();
  },
  updateState: function() {
    this.props.appStateFunction(
        {
          'appCommand': this.state.appCommand,
          'testCommand': this.state.testCommand,
          'debugMode': this.state.debugMode,
          'useCache': this.state.useCache,
          'fileToUpload': this.state.fileToUpload
        }
      );
  },
  render: function() {
    return (
      <form className="appForm">
          <AppPackageButton cacheHitFunction={this.cacheHit} files={this.state.appPackage} onChangeFunction={this.handleAppPackageChange} />

          <div>
            <h4>How do you run your application?</h4>
          </div>
          <input type="text" name="Application Command" id="appCommand" value={this.state.appCommand} onChange={this.handleAppCommandChange} />
          <div>
            <h4>Specify a test command:</h4>
          </div>
          <input type="text" name="Test Command" id="testCommand" value={this.state.testCommand} onChange={this.handleTestCommandChange} />
          <div>
           <input type="checkbox" name="cache" id="useCache" checked={this.state.useCache} onChange={this.handleUseCacheChange} />Use Cache<br />
          </div>

          <div>
           <input type="checkbox" name="debug" id="debugMode" checked={this.state.debugMode} onChange={this.handleDebugModeChange} />Debug Mode<br />
          </div>

          <SubmitButton displayState={this.state.submitButtonDisabledState}
                        onSubmit={this.handleSubmit} />
      </form>
    );
  }
});

var AppPackageButton = React.createClass({
  fetchCache: function() {
      // Fetch current cache values from server to prepopulate application and test command fields
      this.serverRequest = $.get("http://localhost:3000/api/fetchcache", function(cache) {
          var appPackage = this.state.appPackage;
          appPackage = appPackage.replace("C:\\fakepath\\", "");

          if (appPackage in cache._cache) {
            this.props.cacheHitFunction({'appCommand': cache._cache[appPackage][0],
                                         'testCommand': cache._cache[appPackage][1]});
          }
        }.bind(this));
  },

  onChange: function(e) {
    this.setState({appPackage: e.target.value});
    this.fetchCache();
    this.props.onChangeFunction(e.target.files);
  },

  render: function() {
  return (
      <div>
        <h4>Choose your application package:</h4>
        <input type="file" name="file" id="file" onChange={this.onChange} />
      </div>
    );
  }
});

var SubmitButton = React.createClass({
  handleClick: function(e) {
    this.props.onSubmit();
  },

  render: function() {
    var opts = {};
        if (this.props.displayState) {
            opts['disabled'] = 'disabled';
        }
    return (
        <div>
          <input type="button" name="submitButton" id="analyze" onClick={this.handleClick} value="Analyze" 
                 {...opts} />
        </div>
      );
  }
});

export default AppForm;
