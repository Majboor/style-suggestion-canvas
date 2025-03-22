
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle } from "lucide-react";
import styleApiClient from "@/services/StyleApiClient";

const ApiStatusIndicator = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkApiStatus = async () => {
    try {
      // Using the API health endpoint to check if API is responsive
      const healthCheck = await styleApiClient.checkApiHealth();
      setStatus(healthCheck.status === "ok" ? 'online' : 'offline');
    } catch (error) {
      console.error("API status check failed:", error);
      setStatus('offline');
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Check API status every 60 seconds
    const intervalId = setInterval(checkApiStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 cursor-help transition-all-200 hover:opacity-80">
            {status === 'checking' && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse">
                Checking API Status...
              </Badge>
            )}
            
            {status === 'online' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                API Online
              </Badge>
            )}
            
            {status === 'offline' && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <XCircle className="w-3.5 h-3.5 mr-1" />
                API Offline
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="glass-effect">
          <p className="text-xs">Last checked: {lastChecked.toLocaleTimeString()}</p>
          <p className="text-xs mt-1">
            {styleApiClient.isAuthenticated 
              ? `Authenticated: Yes (Iteration ${styleApiClient.getCurrentIteration()}/30)` 
              : "Authenticated: No"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApiStatusIndicator;
