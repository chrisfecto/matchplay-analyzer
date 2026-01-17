import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function PinballAnalyzer() {
  const [profileUrl, setProfileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'avgPosition', direction: 'asc' });

  const extractUserId = (input) => {
    const match = input.match(/\/users\/(\d+)/);
    if (match) return match[1];
    if (/^\d+$/.test(input)) return input;
    return null;
  };

  const analyzePlayer = async () => {
    const userId = extractUserId(profileUrl);

    if (!userId) {
      setError('Please enter a valid Match Play profile URL or user ID');
      return;
    }

    setLoading(true);
    setError('');
    setProgress('Starting analysis...');
    setResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Match Play Analyzer</h1>
          </div>
          <p className="text-purple-200">Analyze pinball performance across all tournaments</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Match Play Profile URL or User ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://app.matchplay.events/users/41535 or 41535"
                  className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-white/50"
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && analyzePlayer()}
                />
                <button
                  onClick={analyzePlayer}
                  disabled={loading || !profileUrl}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="mt-4">
              <div className="w-full bg-white/10 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-purple-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: '50%' }}
                ></div>
              </div>
              <p className="text-sm text-purple-300 text-center">{progress}</p>
              <p className="text-xs text-purple-400 text-center mt-1">
                Analysis takes ~13 seconds to scrape machine names from all tournaments
              </p>
            </div>
          )}
          
          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </div>

        {results && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-400" />
                {results.playerName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-400">{results.totalGamesAnalyzed || 0}</div>
                  <div className="text-sm text-purple-200">Total Games</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-400">{results.participatedTournaments || 0}</div>
                  <div className="text-sm text-blue-200">Tournaments</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">{results.uniqueMachines || 0}</div>
                  <div className="text-sm text-green-200">Unique Machines</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
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
                      <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-2 font-bold text-purple-400">{idx + 1}</td>
                        <td className="py-3 px-2">{machine.machine || 'Unknown'}</td>
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
                    <div key={idx} className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-purple-400 w-8">{idx + 1}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{machine.machine || 'Unknown'}</div>
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
          <p className="mt-2">Analysis typically takes ~13 seconds to scrape machine names from all tournaments</p>
        </div>
      </div>
    </div>
  );
}