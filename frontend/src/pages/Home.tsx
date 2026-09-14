import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => (
  <section>
    <h1>NCPOR Polar Science Outreach Portal</h1>
    <p>
      Explore expedition reports, datasets, and publications from India's polar research
      programme, and read AI-assisted outreach articles drawn directly from the science.
    </p>
    <Link to="/repository">Browse the repository →</Link>
  </section>
);
