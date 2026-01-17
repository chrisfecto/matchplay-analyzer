import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Loader2, Award, ChevronDown, ChevronUp, Swords, Target } from 'lucide-react';

export default function TournamentPrep() {
  const [step, setStep] = useState('select-player'); // 'select-player', 'select-opponent', 'results'
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [expandedMachine, setExpandedMachine] = useState(null);

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

  const selectPlayer = (player) => {
    setSelectedPlayer(player);
    setStep('select-opponent');
  };

  const selectOpponent = async (opponent) => {
    setSelectedOpponent(opponent);
    setLoading(true);
    setError('');
    setStep('results');

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: selectedPlayer.id,
          opponentId: opponent.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compare players');
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      setError(err.message || 'An error occurred during comparison');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('select-player');
    setSelectedPlayer(null);
    setSelectedOpponent(null);
    setResults(null);
    setError('');
    setExpandedMachine(null);
  };

  const getAdvantageColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/50';
    if (score >= 65) return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
    if (score >= 50) return 'text-purple-400 bg-purple-500/20 border-purple-500/50';
    if (score >= 35) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    return 'text-red-400 bg-red-500/20 border-red-500/50';
  };

  const getAdvantageEmoji = (score) => {
    if (score >= 80) return '🔥';
    if (score >= 65) return '💪';
    if (score >= 50) return '👍';
    if (score >= 35) return '⚖️';
    return '⚠️';
  };

  // Step 1: Select Your Player
  if (step === 'select-player') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 pt-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="w-16 h-16 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Tournament Prep
              </h1>
            </div>
            <p className="text-xl text-purple-200">Find your best machine picks against any opponent</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Select Yourself</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => selectPlayer(player)}
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/20 hover:border-purple-400 rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg group-hover:text-purple-300 transition-colors">
                        {player.name}
                      </div>
                      <div className="text-sm text-purple-300/70">ID: {player.id}</div>
                    </div>
                    <Award className="w-5 h-5 text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Select Opponent
  if (step === 'select-opponent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Swords className="w-12 h-12 text-purple-400" />
              <h1 className="text-4xl font-bold">Select Your Opponent</h1>
            </div>
            <p className="text-purple-200 mb-4">Playing as: <span className="font-bold text-purple-400">{selectedPlayer?.name}</span></p>
            <button
              onClick={reset}
              className="text-sm text-purple-300 hover:text-purple-200 underline"
            >
              Change player
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold">Opponent</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {players.filter(p => p.id !== selectedPlayer?.id).map((player) => (
                <button
                  key={player.id}
                  onClick={() => selectOpponent(player)}
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/20 hover:border-red-400 rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg group-hover:text-red-300 transition-colors">
                        {player.name}
                      </div>
                      <div className="text-sm text-purple-300/70">ID: {player.id}</div>
                    </div>
                    <Swords className="w-5 h-5 text-red-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Results
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Machine Recommendations</h1>
          </div>
          <div className="flex items-center justify-center gap-4 text-lg mb-4">
            <span className="text-purple-400 font-bold">{selectedPlayer?.name}</span>
            <span className="text-purple-300">vs</span>
            <span className="text-red-400 font-bold">{selectedOpponent?.name}</span>
          </div>
          <button
            onClick={reset}
            className="text-sm text-purple-300 hover:text-purple-200 underline"
          >
            Start over
          </button>
        </div>

        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
            <p className="text-lg text-purple-300">Analyzing matchup...</p>
            <p className="text-sm text-purple-400 mt-2">Comparing performance across all machines</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-lg rounded-xl p-6 mb-6">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              Start Over
            </button>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-sm text-purple-200 mb-1">Your Stats</div>
                  <div className="text-2xl font-bold text-purple-400">{results.player.totalGames} games</div>
                  <div className="text-sm text-purple-300">{results.player.machinesPlayed} machines</div>
                </div>
                <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
                  <div className="text-sm text-red-200 mb-1">Opponent Stats</div>
                  <div className="text-2xl font-bold text-red-400">{results.opponent.totalGames} games</div>
                  <div className="text-sm text-red-300">{results.opponent.machinesPlayed} machines</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-2">Recommended Machines</h2>
              <p className="text-purple-300 text-sm mb-6">Sorted by your advantage - pick from the top!</p>

              <div className="space-y-2">
                {results.recommendations.map((rec, idx) => (
                  <div key={idx} className="border border-white/20 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedMachine(expandedMachine === idx ? null : idx)}
                      className="w-full bg-white/5 hover:bg-white/10 transition-colors p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-purple-400 w-8">{idx + 1}</div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-lg flex items-center gap-2">
                            {rec.machine}
                            <span className="text-2xl">{getAdvantageEmoji(rec.advantageScore)}</span>
                          </div>
                          <div className="text-sm text-purple-300">{rec.reason}</div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg border font-bold ${getAdvantageColor(rec.advantageScore)}`}>
                          {rec.advantageScore}/100
                        </div>
                        {expandedMachine === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {expandedMachine === idx && (
                      <div className="bg-white/5 p-4 border-t border-white/20">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-bold text-purple-400 mb-2">Your Performance</div>
                            <div className="space-y-1 text-sm">
                              <div>Games Played: <span className="font-bold">{rec.you.gamesPlayed}</span></div>
                              <div>Avg Position: <span className="font-bold">{rec.you.avgPosition ? rec.you.avgPosition.toFixed(2) : 'N/A'}</span></div>
                              <div>Wins: <span className="font-bold">{rec.you.wins}</span></div>
                              <div>Win Rate: <span className="font-bold">{rec.you.winRate.toFixed(1)}%</span></div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-red-400 mb-2">Opponent Performance</div>
                            {rec.opponent ? (
                              <div className="space-y-1 text-sm">
                                <div>Games Played: <span className="font-bold">{rec.opponent.gamesPlayed}</span></div>
                                <div>Avg Position: <span className="font-bold">{rec.opponent.avgPosition ? rec.opponent.avgPosition.toFixed(2) : 'N/A'}</span></div>
                                <div>Wins: <span className="font-bold">{rec.opponent.wins}</span></div>
                                <div>Win Rate: <span className="font-bold">{rec.opponent.winRate.toFixed(1)}%</span></div>
                              </div>
                            ) : (
                              <div className="text-sm italic text-red-300">Never played this machine</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-purple-300 mt-8 pb-8">
          <p>Tournament preparation tool powered by Match Play Events API</p>
        </div>
      </div>
    </div>
  );
}
