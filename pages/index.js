import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Loader2, Award, ChevronDown, ChevronUp, Swords, Target, TrendingUp, Trophy, Zap, ArrowLeft } from 'lucide-react';

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
    if (score >= 80) return 'text-emerald-400 bg-gradient-to-br from-emerald-500/30 to-green-500/30 border-emerald-400/50 shadow-emerald-500/20';
    if (score >= 65) return 'text-cyan-400 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-cyan-400/50 shadow-cyan-500/20';
    if (score >= 50) return 'text-violet-400 bg-gradient-to-br from-violet-500/30 to-purple-500/30 border-violet-400/50 shadow-violet-500/20';
    if (score >= 35) return 'text-amber-400 bg-gradient-to-br from-amber-500/30 to-yellow-500/30 border-amber-400/50 shadow-amber-500/20';
    return 'text-rose-400 bg-gradient-to-br from-rose-500/30 to-red-500/30 border-rose-400/50 shadow-rose-500/20';
  };

  const getAdvantageEmoji = (score) => {
    if (score >= 80) return '🔥';
    if (score >= 65) return '💪';
    if (score >= 50) return '👍';
    if (score >= 35) return '⚖️';
    return '⚠️';
  };

  const getAdvantageGradient = (score) => {
    if (score >= 80) return 'from-emerald-500/20 via-green-500/20 to-emerald-500/20';
    if (score >= 65) return 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20';
    if (score >= 50) return 'from-violet-500/20 via-purple-500/20 to-violet-500/20';
    if (score >= 35) return 'from-amber-500/20 via-yellow-500/20 to-amber-500/20';
    return 'from-rose-500/20 via-red-500/20 to-rose-500/20';
  };

  // Step 1: Select Your Player
  if (step === 'select-player') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-24 sm:-left-48 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-24 sm:-right-48 w-64 h-64 sm:w-96 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <Target className="w-12 h-12 sm:w-20 sm:h-20 text-purple-400 animate-pulse" />
                <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-xl"></div>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Tournament Prep
              </h1>
            </div>
            <p className="text-base sm:text-xl md:text-2xl text-purple-200/80 font-light px-4 max-w-2xl mx-auto">
              Find your best machine picks against any opponent
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 sm:px-6 py-2 backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-xs sm:text-sm text-purple-300">Wizard World Championship</span>
            </div>
          </div>

          {/* Player Selection Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="bg-purple-500/20 rounded-xl p-2 sm:p-3 border border-purple-500/30">
                <Users className="w-5 h-5 sm:w-7 sm:h-7 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-bold">Select Your Player</h2>
                <p className="text-xs sm:text-sm text-purple-300/70">Choose yourself from the roster</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => selectPlayer(player)}
                  className="group relative bg-gradient-to-br from-white/8 to-white/4 active:scale-95 hover:from-white/15 hover:to-white/8 border border-white/20 hover:border-purple-400/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 sm:hover:scale-[1.03] hover:shadow-xl hover:shadow-purple-500/30 overflow-hidden touch-manipulation"
                >
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base sm:text-lg group-hover:text-purple-300 transition-colors mb-1 truncate">
                        {player.name}
                      </div>
                      <div className="text-xs text-purple-300/60 font-mono">ID: {player.id}</div>
                    </div>
                    <div className="bg-purple-500/20 group-hover:bg-purple-500/30 rounded-lg sm:rounded-xl p-2 transition-colors flex-shrink-0">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 sm:mt-12 text-purple-300/60 text-xs sm:text-sm px-4">
            <p>Powered by Match Play Events API & Pinball Map</p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Select Opponent
  if (step === 'select-opponent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-24 sm:-left-48 w-64 h-64 sm:w-96 sm:h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-24 sm:-right-48 w-64 h-64 sm:w-96 sm:h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Swords className="w-10 h-10 sm:w-16 sm:h-16 text-red-400" />
              <h1 className="text-3xl sm:text-5xl font-black">Select Opponent</h1>
            </div>

            {/* Player indicator */}
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 mx-3">
              <span className="text-xs sm:text-sm text-purple-300/70">Playing as:</span>
              <div className="flex items-center gap-1 sm:gap-2 bg-purple-500/20 rounded-full px-3 sm:px-4 py-1 border border-purple-500/30">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                <span className="font-bold text-xs sm:text-base text-purple-300 truncate max-w-[120px] sm:max-w-none">{selectedPlayer?.name}</span>
              </div>
            </div>

            <button
              onClick={reset}
              className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 mx-auto touch-manipulation active:scale-95"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Change player</span>
            </button>
          </div>

          {/* Opponent Selection Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="bg-red-500/20 rounded-xl p-2 sm:p-3 border border-red-500/30">
                <Swords className="w-5 h-5 sm:w-7 sm:h-7 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-bold">Choose Opponent</h2>
                <p className="text-xs sm:text-sm text-red-300/70">Who are you facing?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {players.filter(p => p.id !== selectedPlayer?.id).map((player) => (
                <button
                  key={player.id}
                  onClick={() => selectOpponent(player)}
                  className="group relative bg-gradient-to-br from-white/8 to-white/4 active:scale-95 hover:from-white/15 hover:to-white/8 border border-white/20 hover:border-red-400/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 sm:hover:scale-[1.03] hover:shadow-xl hover:shadow-red-500/30 overflow-hidden touch-manipulation"
                >
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base sm:text-lg group-hover:text-red-300 transition-colors mb-1 truncate">
                        {player.name}
                      </div>
                      <div className="text-xs text-red-300/60 font-mono">ID: {player.id}</div>
                    </div>
                    <div className="bg-red-500/20 group-hover:bg-red-500/30 rounded-lg sm:rounded-xl p-2 transition-colors flex-shrink-0">
                      <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 group-hover:scale-110 transition-transform" />
                    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white pb-safe">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 sm:-left-48 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-24 sm:-right-48 w-64 h-64 sm:w-96 sm:h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400" />
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black">Machine Picks</h1>
          </div>

          {/* Matchup display */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg mb-3 sm:mb-4 flex-wrap px-3">
            <div className="flex items-center gap-1 sm:gap-2 bg-purple-500/20 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 border border-purple-500/30">
              <Award className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-purple-300 font-bold text-xs sm:text-base truncate max-w-[100px] sm:max-w-none">{selectedPlayer?.name}</span>
            </div>
            <span className="text-lg sm:text-2xl">⚔️</span>
            <div className="flex items-center gap-1 sm:gap-2 bg-red-500/20 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 border border-red-500/30">
              <Swords className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-red-300 font-bold text-xs sm:text-base truncate max-w-[100px] sm:max-w-none">{selectedOpponent?.name}</span>
            </div>
          </div>

          <button
            onClick={reset}
            className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 mx-auto touch-manipulation active:scale-95"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Start over</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 sm:p-12 mb-6 text-center border border-white/20 mx-3">
            <div className="relative inline-block mb-4 sm:mb-6">
              <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-purple-400" />
              <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-xl"></div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-300 mb-2">Analyzing matchup...</p>
            <p className="text-sm sm:text-base text-purple-400">Comparing performance across all tournament machines</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 mb-6 mx-3">
            <p className="text-red-300 mb-4 text-base sm:text-lg">{error}</p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors font-semibold border border-red-500/30 touch-manipulation active:scale-95 w-full sm:w-auto"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 px-3 sm:px-0">
              {/* Player Stats */}
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-purple-500/30 rounded-lg sm:rounded-xl p-1.5 sm:p-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                  </div>
                  <div className="text-xs sm:text-sm text-purple-200 font-semibold">Your Stats</div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-purple-300 mb-1">{results.player.totalGames}</div>
                <div className="text-xs sm:text-sm text-purple-300/70">games played</div>
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-purple-500/30">
                  <div className="text-xl sm:text-2xl font-bold text-purple-300">{results.player.machinesPlayed}</div>
                  <div className="text-xs text-purple-300/70">machines</div>
                </div>
              </div>

              {/* Opponent Stats */}
              <div className="bg-gradient-to-br from-red-500/20 to-rose-600/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-500/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-red-500/30 rounded-lg sm:rounded-xl p-1.5 sm:p-2">
                    <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" />
                  </div>
                  <div className="text-xs sm:text-sm text-red-200 font-semibold">Opponent Stats</div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-red-300 mb-1">{results.opponent.totalGames}</div>
                <div className="text-xs sm:text-sm text-red-300/70">games played</div>
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-red-500/30">
                  <div className="text-xl sm:text-2xl font-bold text-red-300">{results.opponent.machinesPlayed}</div>
                  <div className="text-xs text-red-300/70">machines</div>
                </div>
              </div>

              {/* Recommendation Count */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-emerald-500/30 rounded-lg sm:rounded-xl p-1.5 sm:p-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-200 font-semibold">Tournament Ready</div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-300 mb-1">{results.recommendations.length}</div>
                <div className="text-xs sm:text-sm text-emerald-300/70">machines available</div>
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-emerald-500/30 flex items-center gap-2">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  <div className="text-xs text-emerald-300/70">Wizard World approved</div>
                </div>
              </div>
            </div>

            {/* Machine Recommendations */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 mx-3 sm:mx-0">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black mb-0.5 sm:mb-1">Top Machine Picks</h2>
                  <p className="text-xs sm:text-sm text-purple-300/70">Ranked by advantage</p>
                </div>
                <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400 flex-shrink-0" />
              </div>

              <div className="space-y-2 sm:space-y-3">
                {results.recommendations.map((rec, idx) => (
                  <div key={idx} className={`border border-white/20 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ${expandedMachine === idx ? 'shadow-lg' : ''}`}>
                    <button
                      onClick={() => setExpandedMachine(expandedMachine === idx ? null : idx)}
                      className={`w-full bg-gradient-to-r ${getAdvantageGradient(rec.advantageScore)} active:from-white/15 active:via-white/10 active:to-white/15 hover:from-white/10 hover:via-white/5 hover:to-white/10 transition-all duration-300 p-3 sm:p-5 touch-manipulation`}
                    >
                      <div className="flex items-center gap-2 sm:gap-4">
                        {/* Rank Badge */}
                        <div className={`flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-base sm:text-xl ${
                          idx === 0 ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30 text-amber-300 border-2 border-amber-400/50' :
                          idx === 1 ? 'bg-gradient-to-br from-slate-400/30 to-gray-400/30 text-slate-300 border-2 border-slate-400/50' :
                          idx === 2 ? 'bg-gradient-to-br from-orange-500/30 to-amber-600/30 text-orange-300 border-2 border-orange-400/50' :
                          'bg-white/10 text-purple-300 border border-white/20'
                        }`}>
                          {idx + 1}
                        </div>

                        {/* Machine Name & Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-bold text-sm sm:text-xl flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                            <span className="truncate">{rec.machine}</span>
                            <span className="text-lg sm:text-2xl flex-shrink-0">{getAdvantageEmoji(rec.advantageScore)}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-purple-300/80 line-clamp-1">{rec.reason}</div>
                        </div>

                        {/* Score Badge */}
                        <div className={`flex-shrink-0 px-2 py-1 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl border-2 font-black text-sm sm:text-lg shadow-lg ${getAdvantageColor(rec.advantageScore)}`}>
                          {rec.advantageScore}
                          <span className="text-xs opacity-70 hidden sm:inline">/100</span>
                        </div>

                        {/* Expand Icon */}
                        <div className="flex-shrink-0">
                          {expandedMachine === idx ?
                            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" /> :
                            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                          }
                        </div>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {expandedMachine === idx && (
                      <div className="bg-black/30 backdrop-blur-sm p-4 sm:p-6 border-t border-white/10">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                          {/* Your Performance */}
                          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 sm:p-5 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                              <div className="text-xs sm:text-sm font-bold text-purple-300">Your Performance</div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-purple-200/70 text-xs sm:text-sm">Games Played</span>
                                <span className="font-bold text-sm sm:text-base text-purple-300">{rec.you.gamesPlayed}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-purple-200/70 text-xs sm:text-sm">Avg Position</span>
                                <span className="font-bold text-sm sm:text-base text-purple-300">{rec.you.avgPosition ? rec.you.avgPosition.toFixed(2) : 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-purple-200/70 text-xs sm:text-sm">Wins</span>
                                <span className="font-bold text-sm sm:text-base text-purple-300">{rec.you.wins}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-purple-500/20">
                                <span className="text-purple-200/70 text-xs sm:text-sm">Win Rate</span>
                                <span className="font-black text-base sm:text-lg text-purple-300">{rec.you.winRate.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Opponent Performance */}
                          <div className="bg-gradient-to-br from-red-500/10 to-rose-600/10 rounded-xl p-4 sm:p-5 border border-red-500/20">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                              <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                              <div className="text-xs sm:text-sm font-bold text-red-300">Opponent Performance</div>
                            </div>
                            {rec.opponent ? (
                              <div className="space-y-2 sm:space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-red-200/70 text-xs sm:text-sm">Games Played</span>
                                  <span className="font-bold text-sm sm:text-base text-red-300">{rec.opponent.gamesPlayed}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-red-200/70 text-xs sm:text-sm">Avg Position</span>
                                  <span className="font-bold text-sm sm:text-base text-red-300">{rec.opponent.avgPosition ? rec.opponent.avgPosition.toFixed(2) : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-red-200/70 text-xs sm:text-sm">Wins</span>
                                  <span className="font-bold text-sm sm:text-base text-red-300">{rec.opponent.wins}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-red-500/20">
                                  <span className="text-red-200/70 text-xs sm:text-sm">Win Rate</span>
                                  <span className="font-black text-base sm:text-lg text-red-300">{rec.opponent.winRate.toFixed(1)}%</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-6 sm:py-8">
                                <div className="text-center">
                                  <div className="text-3xl sm:text-4xl mb-2">🎯</div>
                                  <div className="text-xs sm:text-sm italic text-red-300/70">Never played this machine</div>
                                  <div className="text-xs text-red-300/50 mt-1">Maximum advantage!</div>
                                </div>
                              </div>
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

        {/* Footer */}
        <div className="text-center text-purple-300/50 text-xs sm:text-sm mt-8 sm:mt-12 pb-6 sm:pb-8 space-y-1 sm:space-y-2 px-4">
          <p>Tournament preparation tool powered by Match Play Events API & Pinball Map</p>
          <p className="text-xs">Data filtered for Wizard World's Pinball Championship • Fort Wayne, Indiana</p>
        </div>
      </div>
    </div>
  );
}
