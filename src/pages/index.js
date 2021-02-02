import React from 'react';
import { graphql } from 'gatsby';

import '../scss/style.scss';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

import Home from './Home';

const Root = () => (
  <div>
      <Header />
      <Home />
      <Footer />
  </div>
);
export default Root;

export const query = graphql`
  # query will go here
  query HomePageQuery {
    site {
      siteMetadata {
        description
      }
    }
  }
`