var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="3.1.0";analytics.load("hTYDrMnqpEcoKL11ene9eLEXY7TwwpxJ");}
unipaper.constant('environmentVariables', {
  contentfulSpaceId: '17u05p4x0l0r',
  contentfulAccessToken: '1c5548283edf847be07e5ffe54af8b46aaadc4b9d3f4bed7b6e413df32411093',
  contentfulManagementToken: '77286d0941ecc2ca3045ff319fa491aaee36e13d78e7441dac1fda28ed354fa0',
  contentfulCategoryIds: {
    entertainment: '2VfbsfUsacI8mAWo60EsuY',
    news: '1TJoidZeWUaWycc2sGSG46',
    sports: '4VY3wnPSgomYoeceseU4mO',
  },
  domainName: 'https://www.unipaper.co.uk',
  analyticsServer: 'https://unipaper-analytics.herokuapp.com'
});
