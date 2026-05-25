/**
 * HouseHunt Visitor Tracker
 * Silently tracks page views across all frontend pages
 */
(function() {
    // Only track once per page load
    fetch('https://backend.househunt.live/api/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_url: window.location.pathname })
    }).catch(e => console.error('Tracker error:', e));
})();
