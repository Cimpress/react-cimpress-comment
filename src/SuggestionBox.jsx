import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import Comment from './Comment';
import '../style/index.css';
import { TextField, shapes } from '@cimpress/react-components';
import CommentsClient from './CommentsClient';
import { SERVICE_URL } from './config';
import { getSubFromJWT } from './helper';
import '../style/autosuggest.css';
import Autosuggest from 'react-autosuggest';

let {Spinner} = shapes;

const languages = [
  {
    name: 'C',
    year: 1972
  },
  {
    name: 'Elm',
    year: 2012
  }
  ];

const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0 ? [] : languages.filter(lang =>
    lang.name.toLowerCase().slice(0, inputLength) === inputValue
  );
};

const getSuggestionValue = suggestion => suggestion.name;

const renderSuggestion = suggestion => (
  <div>
    {suggestion.name}
  </div>
);

export default class SuggestionBox extends React.Component {

  constructor (props) {
    super();
    this.state = {
      value: '',
      suggestions: []
    };
  }

  componentWillUnmount () {
  }

  componentWillMount () {
  }

  componentWillReceiveProps (newProps) {

  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      autoFocus: true,
      name:"autoFocus",
      placeholder: 'Put your comment here, and ...',
      value,
      onChange: this.onChange.bind(this),
      onKeyDown: this.props.addComment.bind(this)
    };

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />);
  }
}

SuggestionBox.propTypes = {
  addComment: PropTypes.func.isRequired
};
