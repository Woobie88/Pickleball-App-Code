function divideIntoTeams(players, teamSize) {
    let teams = [];
    for (let i = 0; i < players.length; i += teamSize) {
        teams.push(players.slice(i, i + teamSize));
    }
    return teams;
}

function generateSchedule(teams, dates) {
    let schedule = {};
    for (let date of dates) {
        schedule[date] = [];
        for (let team of teams) {
            schedule[date].push("Match: " + team.join(", "));
        }
    }
    return schedule;
}

function analyzeResults(schedule, results) {
    let analysis = {};
    for (let date in schedule) {
        analysis[date] = {};
        for (let match of schedule[date]) {
            let team = match.split(": ")[1].split(", ");
            analysis[date][team.join(" & ")] = results[match] || "No result";
        }
    }
    return analysis;
}