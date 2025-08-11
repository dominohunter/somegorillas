export default function SomeGorillasLayout() {
  return (
    <div className="h-screen bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 overflow-hidden">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-xl">🦍</span>
          </div>
          <h1 className="text-white text-xl font-bold">Some Gorillas</h1>
        </div>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium">
          Let&apos;s Play! (10/10) →
        </button>
      </header>

      {/* Main Content Container */}
      <div className="h-full pt-20 pb-4 px-4">
        <div className="h-full flex gap-4">
          {/* Left Sidebar */}
          <div className="w-80 h-full flex flex-col space-y-4">
            {/* Bananas Card */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-white flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🍌</span>
                <div>
                  <p className="text-sm opacity-70">Bananas</p>
                  <p className="text-2xl font-bold">2,409</p>
                </div>
              </div>
            </div>

            {/* Rank Card */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center">
                    <span className="text-xs">📊</span>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">My Rank</p>
                    <p className="text-2xl font-bold">132</p>
                  </div>
                </div>
                <span className="text-xl">→</span>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-xl p-4 overflow-hidden">
              <h2 className="text-white text-lg font-bold mb-4">
                Achievements
              </h2>
              <div className="h-full overflow-y-auto space-y-3 scrollbar-hide">
                {/* Achievement Items */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-white text-2xl">💎</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 h-full flex flex-col space-y-4">
            {/* Tasks Section */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-bold">Tasks</h2>
                <span className="text-white/70 text-sm">New task in 15h</span>
              </div>

              {/* Horizontal Scrolling Tasks */}
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {/* Task 1 - Available */}
                <div className="min-w-[200px] bg-black/40 rounded-xl p-4 text-center flex-shrink-0">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🦍</span>
                  </div>
                  <h3 className="text-white font-bold mb-1">Flip 3x Head</h3>
                  <p className="text-white/70 text-sm mb-3">
                    Flip 3x Head on flipper
                  </p>
                  <div className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium cursor-pointer">
                    +150 bananas
                  </div>
                </div>

                {/* Task 2 - Claimable */}
                <div className="min-w-[200px] bg-black/40 rounded-xl p-4 text-center flex-shrink-0">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🍑</span>
                  </div>
                  <h3 className="text-white font-bold mb-1">Flip 7x Butt</h3>
                  <p className="text-white/70 text-sm mb-3">
                    Flip 7x Butt on flipper
                  </p>
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium w-full">
                    Claim 150 bananas
                  </button>
                </div>

                {/* Task 3 - Completed */}
                <div className="min-w-[200px] bg-black/40 rounded-xl p-4 text-center opacity-60 flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🍑</span>
                  </div>
                  <h3 className="text-white font-bold mb-1">Flip 9x Butt</h3>
                  <p className="text-white/70 text-sm mb-3">
                    Flip 9x Butt on flipper
                  </p>
                  <div className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium">
                    Claimed 150 bananas
                  </div>
                </div>
              </div>

              {/* Referral Section */}
              <div className="bg-black/40 rounded-xl p-4 flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xl">🦍</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">
                      Get 50 bananas for free
                    </h3>
                    <p className="text-white/70 text-sm">
                      Invite your friend and get 50 bananas
                    </p>
                  </div>
                </div>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium">
                  Copy Referral Link
                </button>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-xl p-4 overflow-hidden">
              <h2 className="text-white text-lg font-bold mb-4">Activity</h2>
              <div className="h-full overflow-y-auto space-y-2 scrollbar-hide">
                {/* Activity Items */}
                <div className="flex items-center justify-between py-2 px-3 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div>
                      <span className="text-white text-sm">0x1m...n2</span>
                      <span className="text-white/70 text-sm ml-2">
                        flipped a butt
                      </span>
                    </div>
                  </div>
                  <span className="text-white/50 text-xs">1h</span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div>
                      <span className="text-white text-sm">0x1m...n2</span>
                      <span className="text-white/70 text-sm ml-2">
                        flipped a head
                      </span>
                    </div>
                  </div>
                  <span className="text-white/50 text-xs">1h</span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div>
                      <span className="text-white text-sm">0x1m...n2</span>
                      <span className="text-white/70 text-sm ml-2">
                        earned banana factory achievement
                      </span>
                    </div>
                  </div>
                  <span className="text-white/50 text-xs">1h</span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div>
                      <span className="text-white text-sm">0x1m...n2</span>
                      <span className="text-white/70 text-sm ml-2">
                        flipped a head
                      </span>
                    </div>
                  </div>
                  <span className="text-white/50 text-xs">1h</span>
                </div>

                {/* Add more activity items for scrolling */}
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 bg-black/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                      <div>
                        <span className="text-white text-sm">0x1m...n2</span>
                        <span className="text-white/70 text-sm ml-2">
                          performed an action
                        </span>
                      </div>
                    </div>
                    <span className="text-white/50 text-xs">{i + 2}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
