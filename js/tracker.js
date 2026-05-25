/**
 * HouseHunt Visitor Tracker & Crash Reporter
 * Silently tracks page views and catches unhandled frontend errors
 */
(function() {
    const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : 'https://backend.househunt.live';

    // 1. Track Page View
    fetch(`${BACKEND_URL}/api/track-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_url: window.location.pathname })
    }).catch(e => console.error('Tracker error:', e));

    // 2. Global Crash Reporter
    const reportCrash = (msg, url, lineNo, columnNo, error) => {
        try {
            fetch(`${BACKEND_URL}/api/track-crash`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    url: url || window.location.pathname,
                    line: lineNo,
                    col: columnNo,
                    stack: error ? error.stack : ''
                })
            }).catch(e => {}); // Silent fail
        } catch(e) {}
    };

    window.onerror = function(msg, url, lineNo, columnNo, error) {
        reportCrash(msg, url, lineNo, columnNo, error);
        return false;
    };

    window.addEventListener('unhandledrejection', function(event) {
        reportCrash('Unhandled Promise Rejection: ' + (event.reason ? event.reason.message || event.reason : 'Unknown'), window.location.pathname, 0, 0, event.reason);
    });
})();
