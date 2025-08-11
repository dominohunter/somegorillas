import { SystemStatus } from "@/lib/types";
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

function SystemHealthIndicator({
  healthData,
  showWarning,
  isLoading,
}: {
  healthData?: SystemStatus;
  showWarning: boolean;
  isLoading: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Checking system...</span>
        </div>
      </div>
    );
  }

  if (!healthData) return null;

  const getStatusIcon = () => {
    if (healthData.isHealthy) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (healthData.polling.isActive) {
      return <Clock className="w-4 h-4 text-yellow-400" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    if (healthData.isHealthy) return "border-green-500 bg-green-900/20";
    if (healthData.polling.isActive)
      return "border-yellow-500 bg-yellow-900/20";
    return "border-red-500 bg-red-900/20";
  };

  const getStatusText = () => {
    if (healthData.isHealthy) return "System Healthy";
    if (healthData.polling.isActive) return "Backup Mode";
    return "System Issues";
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <>
      {/* Main Status Indicator */}
      <div
        className={`fixed top-4 right-4 z-50 text-white p-3 rounded-lg shadow-lg border cursor-pointer transition-all duration-200 backdrop-blur-sm ${getStatusColor()}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
          {!healthData.isHealthy && (
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Warning message for non-healthy state */}
        {showWarning && !healthData.isHealthy && (
          <div className="text-xs mt-1 opacity-90">
            {healthData.polling.isActive
              ? "Results may be slightly delayed"
              : "Manual refresh may be needed"}
          </div>
        )}
      </div>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div className="fixed top-16 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl border border-gray-600 max-w-sm backdrop-blur-sm">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">System Status</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Listener Status */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                {healthData.listener.isHealthy ? (
                  <Wifi className="w-3 h-3 text-green-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-400" />
                )}
                <span className="font-medium">Real-time Listener:</span>
                <span
                  className={
                    healthData.listener.isHealthy
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {healthData.listener.isHealthy ? "Active" : "Offline"}
                </span>
              </div>
              {!healthData.listener.isHealthy &&
                healthData.listener.reconnectAttempts > 0 && (
                  <div className="text-xs text-gray-400 ml-5">
                    Reconnect attempts: {healthData.listener.reconnectAttempts}
                  </div>
                )}
            </div>

            {/* Polling Status */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <Clock
                  className={`w-3 h-3 ${healthData.polling.isActive ? "text-blue-400" : "text-gray-400"}`}
                />
                <span className="font-medium">Backup Polling:</span>
                <span
                  className={
                    healthData.polling.isActive
                      ? "text-blue-400"
                      : "text-gray-400"
                  }
                >
                  {healthData.polling.isActive ? "Active" : "Standby"}
                </span>
              </div>
              {healthData.polling.isActive && (
                <div className="text-xs text-gray-400 ml-5">
                  Block: {healthData.polling.lastProcessedBlock}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`w-3 h-3 rounded-full ${healthData.activity.hasRecentActivity ? "bg-green-400" : "bg-yellow-400"}`}
                ></div>
                <span className="font-medium">Recent Activity:</span>
                <span
                  className={
                    healthData.activity.hasRecentActivity
                      ? "text-green-400"
                      : "text-yellow-400"
                  }
                >
                  {healthData.activity.hasRecentActivity ? "Active" : "Quiet"}
                </span>
              </div>
              {healthData.activity.lastFlip && (
                <div className="text-xs text-gray-400 ml-5">
                  Last flip: {formatTimeAgo(healthData.activity.lastFlip)}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-500">
                Last checked: {formatTimeAgo(healthData.checkedAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default SystemHealthIndicator;
