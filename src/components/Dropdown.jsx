import React from 'react';
import ReactDOM from 'react-dom';
import './Dropdown.styl';

export default class Dropdown extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  toggleDropdown() {
    this.setState({ open: !this.state.open });
  }

  handleClick(key) {
    this.setState({ open: false });
    this.props.onChange( key );
  }

  render() {
    return (
      <div className={`dropdown ${(this.state.open ? ' open' : '')}`}>
        <div className="dropdown-label" onClick={this.toggleDropdown}>{this.props.label}</div>
        <div className="dropdown-options"><ul>
          { Object.keys(this.props.options).map(function(item){
            return (
              <li key={item} className={item==this.props.value ? "selected" : ""} onClick={this.handleClick.bind(this,item)}>{this.props.options[item].label}</li>
            )
          } , this) }
        </ul></div>
      </div>
    );
  }



}

Dropdown.propTypes = {
  options: React.PropTypes.object.isRequired
};

Dropdown.defaultProps = {
  options: { 0: {label:' - выберите значение - '} }
};
