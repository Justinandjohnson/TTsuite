import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import TableStatus from './components/TableStatus';
import Queue from './components/Queue';
import QRCodeScanner from './components/QRCodeScanner';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Table Tennis Queue Management</h1>
        <Switch>
          <Route exact path="/" component={TableStatus} />
          <Route path="/queue" component={Queue} />
          <Route path="/scan" component={QRCodeScanner} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
