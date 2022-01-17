import React from 'react';
import { graphql } from 'gatsby';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CalculatorList from '../components/views/CalculatorList';

const Calculators = ({ data }) => {
  const calculators = data.allSitePage.nodes.filter((n) => (!!n.context.meta));
  return (
    <div>
        <Header />
        <div className="calculators-page">
            <div className="container">
                <CalculatorList calculators={calculators} />
            </div>
        </div>
        <Footer />
    </div>
  );
};
export default Calculators;

export const query = graphql`
  # query will go here
  query CalculatorListQuery {
    allSitePage {
      nodes {
        id
        path
        context {
          meta {
            title
            path
            description
            categories
            image {
              large
              small
              author {
                handle
                name
              }
            }
          }
        }
      }
    }
  }
`