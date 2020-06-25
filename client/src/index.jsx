import React from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Description from './components/Description';

function makeUrl(id) {
  return `http://localhost:3000/${id}/description`;
}

class App extends React.Component {
  componentDidMount() {
    const { endpoint } = this.props;
    axios.get(endpoint)
      .then(({ data }) => {
        this.setState({ data });
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  render() {
    const { data } = this.state;
    if (data) {
      return <Description body={data} />;
    }
    return <div>no data</div>;
  }
}

App.propTypes = {
  endpoint: PropTypes.string.isRequired,
};

ReactDOM.render(<App endpoint={makeUrl('001')} />, document.getElementById('container'));
