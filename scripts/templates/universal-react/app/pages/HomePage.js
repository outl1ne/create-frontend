import React from 'react';

export default function HomePage() {
  return <div>Home page</div>;
}

HomePage.getPageData = async (/* location, params, props */) => {
  return prevState => ({
    ...prevState,
    // Add data here that will be added whenever the user navigates to this page
  });
};
