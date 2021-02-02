import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { graphql } from 'gatsby';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CalculatorList from '../components/views/CalculatorList';

const Calculators = () => (
  <div>
      <Header />
      <div className="calculators-page">
          <div className="container">
              <CalculatorList />
          </div>
      </div>
      <Footer />
  </div>
);
export default Calculators;

export const query = graphql`
  # query will go here
  query CalculatorListQuery {
    site {
      siteMetadata {
        description
      }
    }
  }
`