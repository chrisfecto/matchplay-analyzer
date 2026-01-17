import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Home, Users } from 'lucide-react';

export default function PinballAnalyzer() {
  const [view, setView] = useState('selection'); // 'selection' or 'results'
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'avgPosition', direction: 'asc' });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      setPlayers(data.players);
    } catch (err) {
      console.error('Failed to fetch players:', err);
    }
  };

  const analyzePlayer = async (player) => {
    setSelectedPlayer(player);
    setLoading(true);
    setError('');
    setProgress('Starting analysis...');
    setResults(null);
    setView('results');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: player.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze player');
      }

      const data = await response.json();
      setResults(data);
      setProgress('Analysis complete!');

    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setView('selection');
    setResults(null);
    setError('');
    setProgress('');
    setSelectedPlayer(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedMachines = () => {
    if (!results || !results.machineRankings) return [];

    const sorted = [...results.machineRankings];

    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'machine') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      } else {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  // Player Selection View
  if (view === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 pt-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart3 className="w-16 h-16 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Match Play Analyzer
              </h1>
            </div>
            <p className="text-xl text-purple-200">Select a player to analyze their performance</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Players</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => analyzePlayer(player)}
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/20 hover:border-purple-400 rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg group-hover:text-purple-300 transition-colors">
                        {player.name}
                      </div>
                      <div className="text-sm text-purple-300/70">ID: {player.id}</div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-sm text-purple-300 mt-8 pb-8">
            <p>Powered by Match Play Events API</p>
          </div>
        </div>
      </div>
    );
  }

  // Results View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Match Play Analyzer</h1>
          </div>
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Player Selection
          </button>
        </div>

        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
            <div className="w-full bg-white/10 rounded-full h-2.5 mb-2">
              <div
                className="bg-purple-500 h-2.5 rounded-full transition-all duration-300 animate-pulse"
                style={{ width: '50%' }}
              ></div>
            </div>
            <p className="text-sm text-purple-300 text-center flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {progress}
            </p>
            <p className="text-xs text-purple-400 text-center mt-1">
              Analyzing {selectedPlayer?.name}'s performance...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-lg rounded-xl p-6 mb-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={goBack}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-400" />
                {results.playerName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-3xl font-bold text-purple-400">{results.totalGamesAnalyzed || 0}</div>
                  <div className="text-sm text-purple-200">Total Games</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="text-3xl font-bold text-blue-400">{results.participatedTournaments || 0}</div>
                  <div className="text-sm text-blue-200">Tournaments</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
                  <div className="text-3xl font-bold text-green-400">{results.uniqueMachines || 0}</div>
                  <div className="text-sm text-green-200">Unique Machines</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-400">{results.totalWins || 0}</div>
                  <div className="text-sm text-yellow-200">Total Wins</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Machine Performance Rankings</h3>
              <p className="text-sm text-purple-300 mb-4">Click any column header to sort</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-2">Rank</th>
                      <th
                        className="text-left py-3 px-2 cursor-pointer hover:bg-white/5 select-none"
                        onClick={() => handleSort('machine')}
                      >
                        <div className="flex items-center gap-2">
                          Machine
                          <SortIcon columnKey="machine" />
                        </div>
                      </th>
                      <th
                        className="text-right py-3 px-2 cursor-pointer hover:bg-white/5 select-none"
                        onClick={() => handleSort('gamesPlayed')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Games
                          <SortIcon columnKey="gamesPlayed" />
                        </div>
                      </th>
                      <th
                        className="text-right py-3 px-2 cursor-pointer hover:bg-white/5 select-none"
                        onClick={() => handleSort('avgPosition')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Avg Pos
                          <SortIcon columnKey="avgPosition" />
                        </div>
                      </th>
                      <th
                        className="text-right py-3 px-2 cursor-pointer hover:bg-white/5 select-none"
                        onClick={() => handleSort('wins')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Wins
                          <SortIcon columnKey="wins" />
                        </div>
                      </th>
                      <th
                        className="text-right py-3 px-2 cursor-pointer hover:bg-white/5 select-none"
                        onClick={() => handleSort('winRate')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Win %
                          <SortIcon columnKey="winRate" />
                        </div>
                      </th>
                      <th
                        className="text-right py-3 px-2 cursor-pointer hover:bg-white/5 select-none"
                        onClick={() => handleSort('avgPoints')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Avg Pts
                          <SortIcon columnKey="avgPoints" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedMachines().map((machine, idx) => (
                      <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 font-bold text-purple-400">{idx + 1}</td>
                        <td className="py-3 px-2 font-medium">{machine.machine || 'Unknown'}</td>
                        <td className="py-3 px-2 text-right">{machine.gamesPlayed || 0}</td>
                        <td className="py-3 px-2 text-right">
                          {machine.avgPosition ? machine.avgPosition.toFixed(2) : 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-right">{machine.wins || 0}</td>
                        <td className="py-3 px-2 text-right">
                          {machine.winRate ? machine.winRate.toFixed(1) : '0.0'}%
                        </td>
                        <td className="py-3 px-2 text-right">
                          {machine.avgPoints ? machine.avgPoints.toFixed(1) : '0.0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Most Played Machines</h3>
              <div className="space-y-3">
                {results.machineRankings
                  .sort((a, b) => (b.gamesPlayed || 0) - (a.gamesPlayed || 0))
                  .slice(0, 10)
                  .map((machine, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                      <div className="text-2xl font-bold text-purple-400 w-8">{idx + 1}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{machine.machine || 'Unknown'}</div>
                        <div className="text-sm text-purple-200">
                          {machine.gamesPlayed || 0} games • Avg Position: {machine.avgPosition ? machine.avgPosition.toFixed(2) : 'N/A'} • Win Rate: {machine.winRate ? machine.winRate.toFixed(1) : '0'}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-purple-300 mt-8 pb-8">
          <p>Powered by Match Play Events API</p>
        </div>
      </div>
    </div>
  );
}
