import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  User, 
  ImageIcon, 
  BarChart4, 
  Loader2, 
  RefreshCw, 
  LogOut,
  Save,
  Copy,
  Plus,
  HelpCircle,
  BookText,
  Activity
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ApiStatusIndicator from "@/components/ApiStatusIndicator";
import ImageCard from "@/components/ImageCard";
import PreferenceChart from "@/components/PreferenceChart";
import styleApiClient from "@/services/StyleApiClient";

interface StylePreferences {
  [key: string]: number | [string, number] | { [key: string]: number };
}

interface ChartStylePreferences {
  [key: string]: number;
}

const StyleAPI = () => {
  const [accessId, setAccessId] = useState("");
  const [gender, setGender] = useState("women");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [newPreferenceId, setNewPreferenceId] = useState("");
  const [newAiId, setNewAiId] = useState("");
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);
  
  const [imageUrl, setImageUrl] = useState("");
  const [currentIteration, setCurrentIteration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [currentStyle, setCurrentStyle] = useState("");
  const [currentImageKey, setCurrentImageKey] = useState("");
  
  const [preferences, setPreferences] = useState<StylePreferences | null>(null);
  const [chartPreferences, setChartPreferences] = useState<ChartStylePreferences | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [rawProfileResponse, setRawProfileResponse] = useState<any>(null);
  const [rawSaveResponse, setRawSaveResponse] = useState<any>(null);
  
  useEffect(() => {
    if (styleApiClient.isAuthenticated) {
      loadProfile();
      getFirstSuggestion();
    }
  }, []);
  
  const handleAuthenticate = async () => {
    if (!accessId) {
      toast.error("Access ID is required");
      return;
    }
    
    try {
      setIsAuthenticating(true);
      await styleApiClient.authenticate(accessId, gender);
      toast.success("Authentication successful", {
        description: "You can now test the style API features.",
      });
      
      getFirstSuggestion();
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Authentication failed", {
        description: "Please check your access ID and try again.",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const handleCreatePreference = async () => {
    if (!accessId) {
      toast.error("Access ID is required");
      return;
    }
    
    try {
      setIsCreatingPreference(true);
      const response = await styleApiClient.authenticate(accessId, gender);
      setNewPreferenceId(response.preference_id);
      setNewAiId(response.ai_id);
      
      toast.success("New preference created", {
        description: "Use this preference ID for future iterations.",
      });
      
      getFirstSuggestion();
    } catch (error) {
      console.error("Error creating preference:", error);
      toast.error("Failed to create preference", {
        description: "Please try again later.",
      });
    } finally {
      setIsCreatingPreference(false);
    }
  };
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };
  
  const handleLogout = () => {
    styleApiClient.clearSessionData();
    setImageUrl("");
    setCurrentIteration(0);
    setIsCompleted(false);
    setPreferences(null);
    setChartPreferences(null);
    setSelectionHistory([]);
    setNewPreferenceId("");
    setNewAiId("");
    toast.info("Logged out successfully", {
      description: "Your session has been cleared.",
    });
  };
  
  const processStylesForChart = (topStyles: StylePreferences): ChartStylePreferences => {
    const result: ChartStylePreferences = {};
    
    Object.entries(topStyles).forEach(([key, value]) => {
      if (typeof value === 'number') {
        result[key] = value;
      } 
      else if (Array.isArray(value) && value.length === 2 && typeof value[1] === 'number') {
        result[value[0]] = value[1];
      }
      else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.entries(value).forEach(([styleKey, styleValue]) => {
          if (typeof styleValue === 'number') {
            result[styleKey] = styleValue;
          }
        });
      }
    });
    
    return result;
  };
  
  const loadProfile = async () => {
    if (!styleApiClient.isAuthenticated) return;
    
    try {
      setIsLoadingProfile(true);
      const profile = await styleApiClient.getProfile();
      
      setRawProfileResponse(profile);
      
      if (profile.top_styles) {
        setPreferences(profile.top_styles);
        
        const processedStyles = processStylesForChart(profile.top_styles);
        setChartPreferences(processedStyles);
      }
      
      setSelectionHistory(profile.selection_history || []);
    } catch (error) {
      console.error("Error loading profile:", error);
      if (currentIteration > 0) {
        toast.error("Failed to load profile", {
          description: "Please try again later.",
        });
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!styleApiClient.isAuthenticated) {
      toast.error("Please authenticate first");
      return;
    }
    
    try {
      setIsSavingProfile(true);
      const response = await styleApiClient.saveProfile();
      
      setRawSaveResponse(response);
      
      toast.success(response.message || "Profile saved successfully");
      
      setTimeout(() => {
        loadProfile();
      }, 1000);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile", {
        description: "Please try again later.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const getFirstSuggestion = async () => {
    if (!styleApiClient.isAuthenticated) {
      toast.error("Please authenticate first");
      return;
    }
    
    try {
      setIsLoadingSuggestion(true);
      const response = await styleApiClient.submitFeedbackAndGetNextImage();
      
      setImageUrl(response.image_url);
      setCurrentIteration(response.iteration);
      setIsCompleted(response.completed);
      
      if (response.style) {
        setCurrentStyle(response.style);
      }
      if (response.image_key) {
        setCurrentImageKey(response.image_key);
      }
    } catch (error) {
      console.error("Error getting first suggestion:", error);
      toast.error("Failed to get suggestion", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };
  
  const handleNextSuggestion = async () => {
    if (!styleApiClient.isAuthenticated) {
      toast.error("Please authenticate first");
      return;
    }
    
    try {
      setIsLoadingSuggestion(true);
      
      const feedback = "dislike";
      let response;
      
      if (currentIteration === 29) {
        response = await styleApiClient.submitFeedbackAndGetNextImage(
          feedback,
          currentStyle,
          currentImageKey
        );
      } else {
        response = await styleApiClient.submitFeedbackAndGetNextImage(feedback);
      }
      
      setImageUrl(response.image_url);
      setCurrentIteration(response.iteration);
      setIsCompleted(response.completed);
      
      if (response.style) {
        setCurrentStyle(response.style);
      }
      if (response.image_key) {
        setCurrentImageKey(response.image_key);
      }
      
      if (response.completed) {
        loadProfile();
      }
      
    } catch (error) {
      console.error("Error getting next suggestion:", error);
      toast.error("Failed to get next suggestion", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };
  
  const handleFeedbackSubmitted = (newImageUrl?: string, newIteration?: number, style?: string, imageKey?: string) => {
    if (style) {
      setCurrentStyle(style);
    }
    
    if (imageKey) {
      setCurrentImageKey(imageKey);
    }
    
    if (newImageUrl && newIteration) {
      setImageUrl(newImageUrl);
      setCurrentIteration(newIteration);
      setIsCompleted(newIteration >= 30);
      
      setTimeout(() => {
        loadProfile();
      }, 1000);
    } else if (newIteration && !newImageUrl) {
      setCurrentIteration(newIteration);
      setIsCompleted(true);
      
      setTimeout(() => {
        loadProfile();
      }, 1000);
    } else {
      if (!imageUrl) {
        getFirstSuggestion();
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-apple-gray">
      <header className="bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-6 w-6 text-apple-blue" />
            <h1 className="text-2xl font-medium text-apple-black">Style API Tester</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/api-status">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">API Status</span>
              </Button>
            </Link>
            <Link to="/api-docs">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <BookText className="h-4 w-4" />
                <span className="hidden sm:inline">API Docs</span>
              </Button>
            </Link>
            <ApiStatusIndicator />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={styleApiClient.isAuthenticated ? "suggestion" : "auth"} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <TabsList className="glass-effect">
              <TabsTrigger value="auth" className="flex items-center space-x-1">
                <Key className="h-4 w-4" />
                <span>Authentication</span>
              </TabsTrigger>
              <TabsTrigger value="suggestion" className="flex items-center space-x-1">
                <ImageIcon className="h-4 w-4" />
                <span>Suggestions</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-1">
                <BarChart4 className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
            </TabsList>
            
            {styleApiClient.isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:text-destructive ml-auto"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
          
          <TabsContent value="auth" className="space-y-6 animate-fade-in">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>Authenticate to use the Style API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="access-id">Access ID</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="access-id" 
                      value={accessId} 
                      onChange={(e) => setAccessId(e.target.value)} 
                      placeholder="Enter your access ID"
                      disabled={isAuthenticating || styleApiClient.isAuthenticated}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={gender} 
                    onValueChange={setGender}
                    disabled={isAuthenticating || styleApiClient.isAuthenticated}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="men">Men</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="bg-apple-blue hover:bg-apple-blue-light"
                  onClick={handleAuthenticate}
                  disabled={isAuthenticating || styleApiClient.isAuthenticated}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : styleApiClient.isAuthenticated ? (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Authenticated
                    </>
                  ) : (
                    "Authenticate"
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">API Endpoints</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Health Check</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded">
                    <p>GET /api</p>
                    <p className="mt-2">Response:</p>
                    <p>{`{ "status": "ok" }`}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Create Preference</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded">
                    <p>POST /api/preference</p>
                    <p className="mt-2">Headers:</p>
                    <p>Content-Type: application/json</p>
                    <p className="mt-2">Body:</p>
                    <p>{`{ "access_id": "string", "gender": "men|women" }`}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Process Iteration</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded">
                    <p>POST /api/preference/{"{preference_id}"}/iteration/{"{iteration_id}"}</p>
                    <p className="mt-2">Headers:</p>
                    <p>Content-Type: application/json</p>
                    <p>AI-ID: string</p>
                    <p className="mt-2">Body:</p>
                    <p>{`{ "feedback": "like|dislike" }`}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Get/Save Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded">
                    <p>GET/POST /api/preference/{"{preference_id}"}/profile</p>
                    <p className="mt-2">Headers:</p>
                    <p>AI-ID: string</p>
                    <p className="mt-2">Response:</p>
                    <p>User preferences and profile data</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="suggestion" className="animate-fade-in">
            {!styleApiClient.isAuthenticated ? (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Authentication Required</CardTitle>
                  <CardDescription>Please authenticate to view and rate style suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      const authTab = document.querySelector('[data-value="auth"]');
                      if (authTab) {
                        (authTab as HTMLElement).click();
                      }
                    }}
                    className="bg-apple-blue hover:bg-apple-blue-light"
                  >
                    Go to Authentication
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="text-2xl font-medium">Style Suggestions</h2>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={loadProfile}
                      className="transition-all-200"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh Data
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isSavingProfile || isLoadingSuggestion}
                    >
                      {isSavingProfile ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextSuggestion}
                      disabled={isLoadingSuggestion || isCompleted}
                      className="transition-all-200"
                    >
                      {isLoadingSuggestion ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span className="ml-2">Skip & Next</span>
                    </Button>
                  </div>
                </div>
                
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Preference Information</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreatePreference}
                        disabled={isCreatingPreference}
                      >
                        {isCreatingPreference ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-1" />
                        )}
                        Create New Preference
                      </Button>
                    </CardTitle>
                    <CardDescription>Your current preference ID and session details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          Preference ID 
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </Label>
                        <div className="flex">
                          <Input 
                            value={styleApiClient.getPreferenceId() || newPreferenceId || "Not authenticated"} 
                            readOnly 
                            className="font-mono text-sm bg-muted"
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="ml-2"
                            onClick={() => copyToClipboard(
                              styleApiClient.getPreferenceId() || newPreferenceId || "", 
                              "Preference ID"
                            )}
                            disabled={!styleApiClient.getPreferenceId() && !newPreferenceId}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          AI ID
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </Label>
                        <div className="flex">
                          <Input 
                            value={styleApiClient.getAiId() || newAiId || "Not authenticated"} 
                            readOnly 
                            className="font-mono text-sm bg-muted"
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="ml-2"
                            onClick={() => copyToClipboard(
                              styleApiClient.getAiId() || newAiId || "", 
                              "AI ID"
                            )}
                            disabled={!styleApiClient.getAiId() && !newAiId}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Create New Preference</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={accessId}
                          onChange={(e) => setAccessId(e.target.value)}
                          placeholder="Enter access ID for new preference"
                          disabled={isCreatingPreference}
                        />
                        <Select 
                          value={gender} 
                          onValueChange={setGender}
                          disabled={isCreatingPreference}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="women">Women</SelectItem>
                            <SelectItem value="men">Men</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleCreatePreference}
                          className="bg-apple-blue hover:bg-apple-blue-light whitespace-nowrap"
                          disabled={isCreatingPreference || !accessId}
                        >
                          {isCreatingPreference ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-1" />
                          )}
                          Create
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Separator />
                
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-center space-x-2 text-sm mb-4">
                      <span>Progress:</span>
                      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-apple-blue" 
                          style={{ width: `${(currentIteration / 30) * 100}%` }}
                        ></div>
                      </div>
                      <span>{currentIteration}/30</span>
                    </div>
                  </div>
                </div>
                
                {imageUrl ? (
                  <div className="max-w-md mx-auto">
                    <ImageCard
                      imageUrl={imageUrl}
                      iteration={currentIteration}
                      isCompleted={isCompleted}
                      onFeedbackSubmitted={handleFeedbackSubmitted}
                      autoSaveOnCompletion={true}
                    />
                    
                    {isCompleted && (
                      <div className="mt-6 text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-medium text-green-800">All iterations completed!</h3>
                        <p className="text-green-600 mt-1">Your profile has been automatically saved.</p>
                        <Button
                          onClick={() => {
                            const profileTab = document.querySelector('[data-value="profile"]');
                            if (profileTab) {
                              (profileTab as HTMLElement).click();
                            }
                          }}
                          className="mt-3 bg-green-600 hover:bg-green-700"
                        >
                          View My Profile
                        </Button>
                      </div>
                    )}
                  </div>
                ) : isLoadingSuggestion ? (
                  <div className="py-12 flex justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-apple-blue" />
                      <p>Loading suggestion...</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-4 opacity-30" />
                      <p>No suggestion loaded</p>
                      <Button
                        onClick={getFirstSuggestion}
                        className="mt-4 bg-apple-blue hover:bg-apple-blue-light"
                      >
                        Get First Suggestion
                      </Button>
                    </div>
                  </div>
                )}
                
                {chartPreferences && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Preferences Summary</CardTitle>
                      <CardDescription>Quick overview of your style profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PreferenceChart 
                        preferences={chartPreferences} 
                        isLoading={isLoadingProfile} 
                      />
                    </CardContent>
                    <CardFooter className="justify-end">
                      <Button
                        onClick={() => {
                          const profileTab = document.querySelector('[data-value="profile"]');
                          if (profileTab) {
                            (profileTab as HTMLElement).click();
                          }
                        }}
                        variant="outline"
                      >
                        View Full Profile
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="profile" className="animate-fade-in">
            {!styleApiClient.isAuthenticated ? (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Authentication Required</CardTitle>
                  <CardDescription>Please authenticate to view your style profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      const authTab = document.querySelector('[data-value="auth"]');
                      if (authTab) {
                        (authTab as HTMLElement).click();
                      }
                    }}
                    className="bg-apple-blue hover:bg-apple-blue-light"
                  >
                    Go to Authentication
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-medium">Your Style Profile</h2>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={loadProfile}
                      disabled={isLoadingProfile}
                    >
                      {isLoadingProfile ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Refresh
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-apple-blue hover:bg-apple-blue-light"
                      disabled={isLoadingProfile || isSavingProfile}
                    >
                      {isSavingProfile ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save Profile
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {chartPreferences && (
                  <PreferenceChart 
                    preferences={chartPreferences} 
                    isLoading={isLoadingProfile}
                    rawResponse={rawProfileResponse}
                    selectionHistory={selectionHistory}
                  />
                )}
                
                {preferences && (
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle>Raw Style Preferences Data</CardTitle>
                      <CardDescription>Direct data from the API</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48 rounded-md border">
                        <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(preferences, null, 2)}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
                
                {rawSaveResponse && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Save Response</CardTitle>
                      <CardDescription>Raw API response from saving your profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32 rounded-md border">
                        <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(rawSaveResponse, null, 2)}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>Understanding your style preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium">Style Learning</h3>
                      <p className="text-sm text-muted-foreground">
                        Over 30 iterations, the system learns your style preferences through your feedback.
                        Each "like" or "dislike" helps build a profile of your fashion taste.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Preference Building</h3>
                      <p className="text-sm text-muted-foreground">
                        Each time you like or dislike a style, your preferences are updated. The system
                        learns which style categories you prefer and recommends accordingly.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Save Your Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        Saving your profile creates a snapshot of your current preferences. This can be
                        useful for tracking how your style evolves over time.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Style API Tester • Made by techrealm.pk • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StyleAPI;
