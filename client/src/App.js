import React, {Component} from 'react';
import { Route, withRouter, Redirect, Switch} from "react-router-dom";
import Appointment from './containers/Appointment/Appointment';

import Layout from "./containers/Layout/Layout";
import ViewAppointment from './containers/ViewAppointment/ViewAppointment';
import Billing from "./containers/Billing/Billing";

class App extends Component {
  render () {
    return (
      <div>
        <Layout>
          <Switch>
            <Route path="/View" component={ViewAppointment} />
            <Route path="/patientBilling" component={Billing} />
            <Route path="/" exact component={Appointment} />
            <Redirect to="/" />
          </Switch>
        </Layout>
      </div>
    )
  }
}

export default withRouter(App);
