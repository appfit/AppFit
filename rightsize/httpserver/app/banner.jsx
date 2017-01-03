import React from 'react';

var Banner = React.createClass({
  handleTabChange: function(tabName) {
    this.props.tabChangeFunction(tabName);
  },

  render: function() {
    var titleStyle = {
      color: "#ffffff",
      backgroundColor: "#00b3b3",
      width: "auto",
      height: "85%"
    };

    var menuStyle = {
      width: "auto",
      height: "15%",
      backgroundColor: "#00b3b3"
    };

    var tabStyle = {
      listStyleType: "none",
      margin: 0,
      padding: 0,
      overflow: "hidden",
      color: "white"
    };

    var tabListItemStyle = {
      float: "left"
    };

    var tabListItemLinkStyle = {
      display: "inline-block",
      color: "white",
      textAlign: "center",
      padding: "14px 16px",
      textDecoration: "none",
      transition: "0.3s",
      fontSize: "20px",
      fontWeight: "bold"
    };

    return (
        <div>
          <div id="Header">
            <div id="title" style={titleStyle} >
              <h1>Varniya Cloud<em>fit</em> </h1>
            </div>
            <div style={menuStyle} >
              <ul className="tab" style={tabStyle} >
                <li style={tabListItemStyle} ><a href="#" style={tabListItemLinkStyle} 
                                            onClick={this.handleTabChange.bind(this, 'Application')} >Application</a></li>
                <li style={tabListItemStyle} ><a href="#" style={tabListItemLinkStyle} 
                                            onClick={this.handleTabChange.bind(this, 'Tests')} >Tests</a></li>
                <li style={tabListItemStyle} ><a href="#" style={tabListItemLinkStyle} 
                                            onClick={this.handleTabChange.bind(this, 'Results')} >Results</a></li>
              </ul>
            </div>
          </div>
        </div>
    );
  }
});

export default Banner;

