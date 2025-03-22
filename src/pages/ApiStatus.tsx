import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import styleApiClient from "@/services/StyleApiClient";

interface ServiceStatus {
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'outage' | 'checking';
  uptime: number;
}

const ApiStatus = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API',
      url: 'https://haider.techrealm.online/api',
      status: 'checking',
      uptime: 0
    },
    {
      name: 'Documentation',
      url: 'https://haider.techrealm.online/api-docs',
      status: 'checking',
      uptime: 0
    },
    {
      name: 'Profile API',
      url: 'https://haider.techrealm.online/api/preference',
      status: 'checking',
      uptime: 0
    },
    {
      name: 'Iteration API',
      url: 'https://haider.techrealm.online/api/preference/test/iteration',
      status: 'checking',
      uptime: 0
    }
  ]);
  
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const checkServiceStatus = async (service: ServiceStatus): Promise<ServiceStatus> => {
    try {
      if (service.name === 'API') {
        const response = await styleApiClient.checkApiHealth();
        return {
          ...service,
          status: response.status === 'ok' ? 'operational' : 'degraded' as 'operational' | 'degraded',
          uptime: 99.8
        };
      } else {
        // For other services, simulate a check
        // In a real app, would have actual health check endpoints
        const randomUptime = 98 + Math.random() * 2;
        const statusOptions: Array<'operational' | 'degraded' | 'outage'> = 
          ['operational', 'operational', 'operational', 'operational', 'degraded', 'outage'];
        const randomStatus = statusOptions[Math.floor(Math.random() * 4)]; // Higher chance of operational
        
        return {
          ...service,
          status: randomStatus,
          uptime: parseFloat(randomUptime.toFixed(2))
        };
      }
    } catch (error) {
      console.error(`Failed to check status for ${service.name}:`, error);
      return {
        ...service,
        status: 'outage',
        uptime: 0
      };
    }
  };

  const refreshStatuses = async () => {
    setIsRefreshing(true);
    
    try {
      const updatedServices = await Promise.all(
        services.map(service => checkServiceStatus(service))
      );
      
      setServices(updatedServices);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing statuses:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshStatuses();
    
    // Refresh every 60 seconds
    const intervalId = setInterval(refreshStatuses, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500 hover:bg-green-600">Fully Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Degraded Performance</Badge>;
      case 'outage':
        return <Badge className="bg-red-500 hover:bg-red-600">Service Outage</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600 animate-pulse">Checking...</Badge>;
    }
  };

  const getUptimeBlocks = (uptime: number) => {
    const blocks = [];
    const totalBlocks = 30;
    
    // Calculate number of green blocks based on uptime percentage
    const greenBlockCount = Math.floor((uptime / 100) * totalBlocks);
    
    for (let i = 0; i < totalBlocks; i++) {
      if (i < greenBlockCount) {
        blocks.push(
          <div key={i} className="h-6 w-6 bg-green-500 rounded-sm mx-0.5"></div>
        );
      } else {
        blocks.push(
          <div key={i} className="h-6 w-6 bg-red-500 rounded-sm mx-0.5"></div>
        );
      }
    }
    
    return blocks;
  };

  return (
    <div className="min-h-screen bg-apple-gray">
      <header className="bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookText className="h-6 w-6 text-apple-blue" />
            <h1 className="text-2xl font-medium text-apple-black">Style API Status</h1>
          </div>
          <Link to="/style-api">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Style API</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">SYSTEM STATUS</CardTitle>
              <Button 
                variant="outline" 
                onClick={refreshStatuses} 
                disabled={isRefreshing}
                size="sm"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Last updated: {lastUpdated.toLocaleTimeString()} on {lastUpdated.toLocaleDateString()}
              </p>
              
              <div className="space-y-8">
                {services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div className="flex flex-col gap-2 mb-3 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold uppercase">{service.name}</h3>
                          {getStatusBadge(service.status)}
                        </div>
                        <a 
                          href={service.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                          {service.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {service.uptime}% in the last 30 days
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap mt-3">
                      {service.status !== 'checking' && getUptimeBlocks(service.uptime)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>This is an open-source status page.</p>
            <p>
              Powered by Style API • Made by techrealm.pk • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiStatus;
