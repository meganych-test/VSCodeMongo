document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/players-data')
        .then(response => response.json())
        .then(data => {
            const { players, totalPlayers, pointPool, poolNow } = data;

            document.getElementById('totalPlayers').innerText = totalPlayers;
            document.getElementById('totalTapGameClicks').innerText = players.reduce((sum, player) => sum + player.tapGameClicks, 0);
            document.getElementById('initialPool').innerText = pointPool;
            document.getElementById('currentPool').innerText = poolNow;

            const playerCards = document.getElementById('playerCards');
            playerCards.innerHTML = players.map(player => createPlayerCard(player)).join('');
        })
        .catch(error => console.error('Error fetching player data:', error));
});

function createPlayerCard(player) {
    return `
        <div class="player-card">
            <h3>${player.fullName}</h3>
            <p><strong>TelegramID:</strong> ${player.telegramId} | ${player.userName}</p>
            <p>Registered on ${new Date(player.createdAt).toLocaleDateString()} | Days playing ${Math.floor((Date.now() - new Date(player.createdAt)) / (1000 * 60 * 60 * 24))}</p>
            <p>Referred by: ${player.referredBy} | Player referrals: ${player.referralCount}</p>
            <p>Player WEB3 wallet: ${player.web3Wallet}</p>
            <p><strong>Tap Game Balance:</strong> ${player.tapGameBalance}</p>
            <p><strong>Tap Game Level:</strong> ${player.tapGameLevel}</p>
            <p><strong>Auto Game Balance:</strong> ${player.autoGameBalance}</p>
            <p><strong>Auto Points Level:</strong> ${player.autoPointsLevel}</p>
            <p><strong>Referral Earnings:</strong> ${player.referralEarnings}</p>
            <p><strong>Referrals Level:</strong> ${player.referralsLevel}</p>
            <p><strong>Player Balance:</strong> ${player.totalBalance}</p>
            <p><strong>WEB3 Withdrawals Requests:</strong> ${player.web3WithdrawalsRequests}</p>
            <p><strong>Tap Game Clicks:</strong> ${player.tapGameClicks}</p>
            <p><strong>Status:</strong> ${player.status === 'active' ? '<span class="connected-status">Connected</span>' : '<span class="blocked-status">Blocked</span>'}</p>
            <button class="edit-button">Edit</button>
            <button class="block-button">${player.status === 'active' ? 'Block' : 'Unblock'}</button>
            <button class="delete-button">Delete</button>
        </div>
    `;
}
