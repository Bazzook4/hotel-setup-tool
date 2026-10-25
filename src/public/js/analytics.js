// Vercel Web Analytics
// This script injects Vercel Web Analytics tracking for static HTML pages
// See: https://vercel.com/docs/analytics/quickstart

(function() {
  // Inject Vercel Analytics
  // For static sites, Vercel automatically serves the analytics script
  // We just need to add the script tag that points to /_vercel/insights/script.js
  
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  
  // Insert the script at the end of the head
  if (document.head) {
    document.head.appendChild(script);
  } else {
    // Fallback: wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  }
})();
