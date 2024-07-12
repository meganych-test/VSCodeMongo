function generateDynamicStyles(schema) {
    let styles = `
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f0f0f0;
    }
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
    .header {
        background-color: #e6f2ff;
        padding: 20px;
        border-radius: 5px;
        margin-bottom: 20px;
    }
    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    .add-player-btn {
        background-color: #ddd;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
    }
    .sort-options {
        text-align: right;
        margin-top: 10px;
    }
    .player-card {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        margin-bottom: 20px;
        padding: 20px;
    }
    .player-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    .connected-status {
        background-color: #4CAF50;
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
    }
    .player-actions {
        margin-left: 10px;
    }
    .player-actions button {
        background: none;
        border: none;
        color: blue;
        cursor: pointer;
        margin-left: 5px;
    }
    .player-info {
        margin-bottom: 15px;
    }
    .player-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
    }
    .stat-item {
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 3px;
    }
    @media (max-width: 768px) {
        .header-top {
            flex-direction: column;
            align-items: flex-start;
        }
        .add-player-btn {
            margin-top: 10px;
        }
        .sort-options {
            text-align: left;
            margin-top: 10px;
        }
        .player-header {
            flex-direction: column;
            align-items: flex-start;
        }
        .player-actions {
            margin-top: 10px;
            margin-left: 0;
        }
    }
    `;

    // Add dynamic styles based on schema
    Object.keys(schema).forEach(field => {
        styles += `
        .player-${field} {
            margin-bottom: 5px;
        }
        `;
    });

    return styles;
}

module.exports = generateDynamicStyles;