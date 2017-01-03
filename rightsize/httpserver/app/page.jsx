import React from 'react';
import Banner from './banner.jsx';
import AppForm from './appForm.jsx';
import TestForm from './testForm.jsx';
import ResultsForm from './resultsForm.jsx';

var Page = React.createClass({
  getInitialState: function() {
    return {'currentTab': 'Application',
            'analyze': false,
            'appState': {},
            'resultsState': {} };
  },

  handleTabClick: function(tabName) {
    this.setState({'currentTab': tabName});
    if (tabName === 'Results') {
      this.setState({'analyze': false});
    }
  },

  handleFileToUpload: function(fileToUpload) {
    this.setState({'fileToUpload': fileToUpload});
  },

  handleAnalyze: function(appCommand, testCommand, debugMode, useCache) {
    this.setState({'appCommand': appCommand});
    this.setState({'testCommand': testCommand});
    this.setState({'debugMode': debugMode});
    this.setState({'useCache': useCache});
    this.setState({'currentTab': 'Results'});
    this.setState({'analyze': !this.state.analyze});
  },

  handleAppState: function(appState) {
    this.setState({'appState': appState});
  },

  handleResultsState: function(resultsState) {
    this.setState({'resultsState': resultsState});
  },

  render: function() {
    if (this.state.currentTab === 'Application') {
        return (
        <div>
          <Banner tabChangeFunction={this.handleTabClick} />
          <AppForm fileToUploadFunction={this.handleFileToUpload}
                   analyzeFunction={this.handleAnalyze}
                   appState={this.state.appState}
                   appStateFunction={this.handleAppState} />
        </div>
        );
    } else if (this.state.currentTab === 'Tests') {
      return (
        <div>
          <Banner tabChangeFunction={this.handleTabClick} />
          <TestForm ref={'TestsForm'} />
        </div>
        );
    } else if (this.state.currentTab === 'Results') {
      return (
        <div>
          <Banner tabChangeFunction={this.handleTabClick} />
          <ResultsForm fileToUpload={this.state.fileToUpload} 
                       appCommand={this.state.appCommand}
                       testCommand={this.state.testCommand}
                       debugMode={this.state.debugMode}
                       useCache={this.state.useCache}
                       analyze={this.state.analyze}
                       resultsState={this.state.resultsState}
                       resultsStateFunction={this.handleResultsState} />
        </div>
        );
    }
  }
});

export default Page;
