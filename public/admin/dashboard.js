// Initialize SSE connection
const evtSource = new EventSource('/admin/dashboard/events');

// Update stats when receiving SSE updates
evtSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    updateDashboard(data.stats);
    updateLastUpdated(data.timestamp);
};

// Handle SSE connection errors
evtSource.onerror = function(err) {
    console.error('SSE Error:', err);
    setTimeout(() => {
        window.location.reload();
    }, 5000);
};

// Update dashboard statistics
function updateDashboard(stats) {
    // Update stat cards
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('totalGames').textContent = stats.totalGames;
    document.getElementById('activeGames').textContent = stats.activeGames;
    document.getElementById('totalPlayers').textContent = stats.totalPlayers;
    document.getElementById('avgPlayers').textContent = stats.averagePlayersPerGame;
    
    // Update most active creator
    const creatorElement = document.getElementById('mostActiveCreator');
    if (stats.mostActiveCreator) {
        creatorElement.textContent = 
            `${stats.mostActiveCreator.username} (${stats.mostActiveCreator.games} games)`;
    } else {
        creatorElement.textContent = 'None';
    }
}

// Update last updated timestamp
function updateLastUpdated(timestamp) {
    const date = new Date(timestamp);
    document.getElementById('lastUpdated').textContent = 
        `Last updated: ${date.toLocaleTimeString()}`;
}