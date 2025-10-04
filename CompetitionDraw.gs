function createCompetitionDraw() {
  // Config
  const teams = ['A', 'B', 'C'];
  const teamSize = 5;
  const rounds = 10;
  const gamesPerRound = [
    ['A', 'B'],
    ['B', 'C'],
    ['A', 'C'],
  ];
  const sheetName = 'Competition Draw';

  // Player structure {team: 'A', name: 'A1', rests: [rounds], lastRest: -999}
  let players = [];
  teams.forEach(team => {
    for (let i = 1; i <= teamSize; i++) {
      players.push({team, name: team + i, rests: [], lastRest: -999});
    }
  });

  // Helper function to pick a rest player for a team for a round
  function pickRestingPlayer(team, round, restHistory) {
    // Get all players in team
    let teamPlayers = players.filter(p => p.team === team);
    // 1. Exclude players who rested less often
    let restCounts = teamPlayers.map(p => p.rests.length);
    let minRest = Math.min(...restCounts);
    let candidates = teamPlayers.filter(p => p.rests.length === minRest);
    // 2. Exclude those who rested in last 3 rounds
    candidates = candidates.filter(p => p.rests.every(r => Math.abs(r - round) > 3));
    // 3. If multiple candidates, randomize
    if (candidates.length === 0) {
      // fallback to anyone with minRest who hasn't rested last round
      candidates = teamPlayers.filter(p => p.rests.length === minRest && p.rests.every(r => r !== round-1));
      if (candidates.length === 0) candidates = teamPlayers.filter(p => p.rests.length === minRest);
    }
    // 4. If still tied, random pick
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Draw structure: [{round, game, team1, team2, team1players, team2players, resting}]
  let draw = [];
  let restHistory = {}; // round -> {A: player, B: player, C: player}

  for (let round = 1; round <= rounds; round++) {
    restHistory[round] = {};
    // Pick resting players for each team
    teams.forEach(team => {
      let restPlayer = pickRestingPlayer(team, round, restHistory);
      restPlayer.rests.push(round);
      restPlayer.lastRest = round;
      restHistory[round][team] = restPlayer.name;
    });

    // For each game, pick 4 available players from each team
    gamesPerRound.forEach(([t1, t2], gidx) => {
      let t1Available = players.filter(p => p.team === t1 && !p.rests.includes(round));
      let t2Available = players.filter(p => p.team === t2 && !p.rests.includes(round));
      // Shuffle to randomize partners/opponents
      t1Available = shuffleArray(t1Available).slice(0, 4);
      t2Available = shuffleArray(t2Available).slice(0, 4);
      draw.push({
        round,
        game: `${t1} vs ${t2}`,
        team1: t1,
        team1players: t1Available.map(p => p.name).join(', '),
        team2: t2,
        team2players: t2Available.map(p => p.name).join(', '),
        resting: `${t1}: ${restHistory[round][t1]}, ${t2}: ${restHistory[round][t2]}`
      });
    });
  }

  // Output to Google Sheet
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear();
  let headers = ['Round', 'Game', 'Team 1', 'Team 1 Players', 'Team 2', 'Team 2 Players', 'Resting'];
  sheet.appendRow(headers);
  draw.forEach(row =>
    sheet.appendRow([row.round, row.game, row.team1, row.team1players, row.team2, row.team2players, row.resting])
  );
}

// Helper function to shuffle array
function shuffleArray(arr) {
  let array = arr.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}