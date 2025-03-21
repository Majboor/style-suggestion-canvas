
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Terminal, Code2, Globe, Server, BookText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ApiDocs = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen bg-apple-gray">
      <header className="bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookText className="h-6 w-6 text-apple-blue" />
            <h1 className="text-2xl font-medium text-apple-black">Style API Documentation</h1>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            Base URL: https://haider.techrealm.online/api
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>Jump to a specific section</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-1">
                      {[
                        { name: "Introduction", href: "#introduction" },
                        { name: "Authentication", href: "#authentication" },
                        { name: "Health Check", href: "#health-check" },
                        { name: "Create Preference", href: "#create-preference" },
                        { name: "Process Iteration", href: "#process-iteration" },
                        { name: "Save Profile", href: "#save-profile" },
                        { name: "Get Profile", href: "#get-profile" },
                        { name: "Error Handling", href: "#error-handling" },
                        { name: "Code Examples", href: "#code-examples" },
                      ].map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                        >
                          {item.name}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Test Credentials</CardTitle>
                    <CardDescription>For development</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="p-2 bg-gray-50 rounded-md">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Test AI-ID:</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => copyToClipboard("AI_test_user_123_2d550589", "test-ai-id")}
                          >
                            {copiedEndpoint === "test-ai-id" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="mt-1">AI_test_user_123_2d550589</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:w-3/4">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle id="introduction" className="scroll-mt-24 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-apple-blue" />
                    Introduction
                  </CardTitle>
                  <CardDescription>
                    The Style Preference API allows you to create and manage user style preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>
                    This API enables applications to build personalized style profiles for users through an iterative feedback process. 
                    Users provide feedback on style images, and the API builds a preference profile over time.
                  </p>
                  <p>
                    The complete flow involves:
                  </p>
                  <ol>
                    <li>Creating a preference session</li>
                    <li>Processing 30 iterations of style images with user feedback</li>
                    <li>Saving the resulting preference profile</li>
                    <li>Retrieving the profile as needed</li>
                  </ol>
                  <p>
                    <strong>Base URL:</strong>{" "}
                    <code className="px-1 py-0.5 bg-gray-100 rounded">https://haider.techrealm.online/api</code>
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle id="authentication" className="scroll-mt-24 flex items-center gap-2">
                    <Server className="h-5 w-5 text-apple-blue" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>
                    All endpoints except the health check require an <code>AI-ID</code> header for authentication.
                    This ID is obtained from the preference creation endpoint.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="font-mono text-sm whitespace-pre-wrap">
                      {`AI-ID: AI_test_user_123_2d550589 # For testing only`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                {/* Health Check */}
                <Card id="health-check" className="scroll-mt-24">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-green-500">GET</Badge>
                        <span>/api</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => copyToClipboard("https://haider.techrealm.online/api", "health-check")}
                      >
                        {copiedEndpoint === "health-check" ? (
                          <>
                            <Check className="mr-1 h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" /> Copy URL
                          </>
                        )}
                      </Button>
                    </div>
                    <CardDescription>Health Check - Verify API availability</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="response">
                      <TabsList>
                        <TabsTrigger value="response">Response</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="response" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`{
    "status": "ok"
}`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="curl" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`curl -X GET "https://haider.techrealm.online/api"`}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Create Preference */}
                <Card id="create-preference" className="scroll-mt-24">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-blue-500">POST</Badge>
                        <span>/api/preference</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => copyToClipboard("https://haider.techrealm.online/api/preference", "create-preference")}
                      >
                        {copiedEndpoint === "create-preference" ? (
                          <>
                            <Check className="mr-1 h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" /> Copy URL
                          </>
                        )}
                      </Button>
                    </div>
                    <CardDescription>Create a new style preference session</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="request">
                      <TabsList>
                        <TabsTrigger value="request">Request</TabsTrigger>
                        <TabsTrigger value="response">Response</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="request" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`{
    "access_id": "test_user_123",
    "gender": "women"  // or "men"
}`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="response" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`{
    "preference_id": "550e8400-e29b-41d4-a716-446655440000",
    "ai_id": "AI_test_user_123_2d550589"
}`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="curl" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`curl -X POST "https://haider.techrealm.online/api/preference" \\
  -H "Content-Type: application/json" \\
  -d '{"access_id": "test_user_123", "gender": "women"}'`}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Process Iteration */}
                <Card id="process-iteration" className="scroll-mt-24">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-blue-500">POST</Badge>
                        <span>/api/preference/{"{preference_id}"}/iteration/{"{iteration_id}"}</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => copyToClipboard("https://haider.techrealm.online/api/preference/{preference_id}/iteration/{iteration_id}", "process-iteration")}
                      >
                        {copiedEndpoint === "process-iteration" ? (
                          <>
                            <Check className="mr-1 h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" /> Copy URL
                          </>
                        )}
                      </Button>
                    </div>
                    <CardDescription>Submit feedback and receive next image</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium mb-2">Headers</h4>
                    <div className="bg-gray-50 rounded-md p-4 mb-4">
                      <pre className="font-mono text-sm whitespace-pre-wrap">
                        {`AI-ID: AI_test_user_123_2d550589`}
                      </pre>
                    </div>

                    <h4 className="text-sm font-medium mb-2">Path Parameters</h4>
                    <div className="bg-gray-50 rounded-md p-4 mb-4">
                      <pre className="font-mono text-sm whitespace-pre-wrap">
                        {`preference_id - UUID from preference creation
iteration_id  - Number 1-30`}
                      </pre>
                    </div>

                    <Tabs defaultValue="requestEarly">
                      <TabsList>
                        <TabsTrigger value="requestEarly">Request (Iterations 1-29)</TabsTrigger>
                        <TabsTrigger value="requestFinal">Request (Iteration 30)</TabsTrigger>
                        <TabsTrigger value="responseEarly">Response (Iterations 1-29)</TabsTrigger>
                        <TabsTrigger value="responseFinal">Response (Iteration 30)</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="requestEarly" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`{
    "feedback": "like"  // or "dislike"
}`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="requestFinal" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`{
    "feedback": "like",  // or "dislike"
    "style": "casual",
    "image_key": "women/casual/img123.jpg"
}`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="responseEarly" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`{
    "image_url": "https://example.com/image.jpg",
    "iteration": 1,
    "completed": false,
    "style": "casual",
    "image_key": "women/casual/img123.jpg"
}`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="responseFinal" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`{
    "image_url": null,
    "iteration": 30,
    "completed": true
}`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="curl" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`# For iterations 1-29
curl -X POST "https://haider.techrealm.online/api/preference/550e8400-e29b-41d4-a716-446655440000/iteration/1" \\
  -H "Content-Type: application/json" \\
  -H "AI-ID: AI_test_user_123_2d550589" \\
  -d '{"feedback": "like"}'

# For iteration 30
curl -X POST "https://haider.techrealm.online/api/preference/550e8400-e29b-41d4-a716-446655440000/iteration/30" \\
  -H "Content-Type: application/json" \\
  -H "AI-ID: AI_test_user_123_2d550589" \\
  -d '{"feedback": "like", "style": "casual", "image_key": "women/casual/img123.jpg"}'`}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Save Profile */}
                <Card id="save-profile" className="scroll-mt-24">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-blue-500">POST</Badge>
                        <span>/api/preference/{"{preference_id}"}/profile</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => copyToClipboard("https://haider.techrealm.online/api/preference/{preference_id}/profile", "save-profile")}
                      >
                        {copiedEndpoint === "save-profile" ? (
                          <>
                            <Check className="mr-1 h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" /> Copy URL
                          </>
                        )}
                      </Button>
                    </div>
                    <CardDescription>Save the completed preference profile</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium mb-2">Headers</h4>
                    <div className="bg-gray-50 rounded-md p-4 mb-4">
                      <pre className="font-mono text-sm whitespace-pre-wrap">
                        {`AI-ID: AI_test_user_123_2d550589`}
                      </pre>
                    </div>

                    <Tabs defaultValue="response">
                      <TabsList>
                        <TabsTrigger value="response">Response</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="response" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`{
    "message": "Profile saved successfully"
}`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="curl" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`curl -X POST "https://haider.techrealm.online/api/preference/550e8400-e29b-41d4-a716-446655440000/profile" \\
  -H "AI-ID: AI_test_user_123_2d550589"`}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Get Profile */}
                <Card id="get-profile" className="scroll-mt-24">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-green-500">GET</Badge>
                        <span>/api/preference/{"{preference_id}"}/profile</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => copyToClipboard("https://haider.techrealm.online/api/preference/{preference_id}/profile", "get-profile")}
                      >
                        {copiedEndpoint === "get-profile" ? (
                          <>
                            <Check className="mr-1 h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" /> Copy URL
                          </>
                        )}
                      </Button>
                    </div>
                    <CardDescription>Retrieve the saved preference profile</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium mb-2">Headers</h4>
                    <div className="bg-gray-50 rounded-md p-4 mb-4">
                      <pre className="font-mono text-sm whitespace-pre-wrap">
                        {`AI-ID: AI_test_user_123_2d550589`}
                      </pre>
                    </div>

                    <Tabs defaultValue="response">
                      <TabsList>
                        <TabsTrigger value="response">Response</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="response" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`{
    "top_styles": {
        "casual": 0.8,
        "formal": 0.6,
        "sporty": 0.4
    },
    "selection_history": [
        {
            "image": "women/casual/img123.jpg",
            "style": "casual",
            "feedback": "Like",
            "score_change": 0.1,
            "current_score": 0.8,
            "timestamp": 1679444374
        }
    ]
}`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="curl" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {`curl -X GET "https://haider.techrealm.online/api/preference/550e8400-e29b-41d4-a716-446655440000/profile" \\
  -H "AI-ID: AI_test_user_123_2d550589"`}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Error Handling */}
                <Card id="error-handling" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-apple-blue" />
                      Error Handling
                    </CardTitle>
                    <CardDescription>Common error responses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">400 Bad Request</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <pre className="font-mono text-sm whitespace-pre-wrap">
                          {`{
    "error": "Invalid parameters"
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">401 Unauthorized</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <pre className="font-mono text-sm whitespace-pre-wrap">
                          {`{
    "error": "Invalid AI ID"
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">404 Not Found</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <pre className="font-mono text-sm whitespace-pre-wrap">
                          {`{
    "error": "Resource not found"
}`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Code Examples */}
                <Card id="code-examples" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-apple-blue" />
                      Code Examples
                    </CardTitle>
                    <CardDescription>Integration examples in different languages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="python">
                      <TabsList>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="python" className="mt-4">
                        <ScrollArea className="h-[500px] rounded-md border">
                          <div className="bg-gray-50 p-4">
                            <pre className="font-mono text-sm whitespace-pre-wrap">
                              {`import requests
import json

# API Base URL
BASE_URL = "https://haider.techrealm.online/api"

# Test credentials
ACCESS_ID = "test_user_123"
GENDER = "women"  # or "men"

def check_health():
    """Check if the API is running."""
    response = requests.get(f"{BASE_URL}")
    return response.json()

def create_preference():
    """Create a new preference session."""
    payload = {
        "access_id": ACCESS_ID,
        "gender": GENDER
    }
    response = requests.post(f"{BASE_URL}/preference", json=payload)
    return response.json()

def process_iteration(preference_id, ai_id, iteration, feedback, style=None, image_key=None):
    """Process an iteration and get the next image."""
    headers = {
        "AI-ID": ai_id
    }
    
    payload = {
        "feedback": feedback
    }
    
    # For the final iteration, include style and image_key
    if iteration == 30:
        payload["style"] = style
        payload["image_key"] = image_key
    
    response = requests.post(
        f"{BASE_URL}/preference/{preference_id}/iteration/{iteration}",
        headers=headers,
        json=payload
    )
    return response.json()

def save_profile(preference_id, ai_id):
    """Save the user's preference profile."""
    headers = {
        "AI-ID": ai_id
    }
    response = requests.post(
        f"{BASE_URL}/preference/{preference_id}/profile",
        headers=headers
    )
    return response.json()

def get_profile(preference_id, ai_id):
    """Get the user's preference profile."""
    headers = {
        "AI-ID": ai_id
    }
    response = requests.get(
        f"{BASE_URL}/preference/{preference_id}/profile",
        headers=headers
    )
    return response.json()

# Example usage flow
def main():
    # Check if API is healthy
    health = check_health()
    print("API Health:", health)
    
    # Create a new preference
    pref = create_preference()
    preference_id = pref["preference_id"]
    ai_id = pref["ai_id"]
    print(f"Created preference: {preference_id}, AI-ID: {ai_id}")
    
    # Process iterations (normally would be done in a loop with user input)
    current_iteration = 1
    last_style = None
    last_image_key = None
    
    # Example: Process first iteration
    result = process_iteration(preference_id, ai_id, current_iteration, "like")
    print(f"Iteration {current_iteration} result:", result)
    
    # Save the style and image_key for the final iteration
    last_style = result.get("style")
    last_image_key = result.get("image_key")
    current_iteration += 1
    
    # Continue until all 30 iterations are done...
    # For brevity, we're skipping to the final iteration
    
    # Final iteration (30th) - must include style and image_key
    final_result = process_iteration(
        preference_id, 
        ai_id, 
        30,  # Final iteration
        "like", 
        last_style, 
        last_image_key
    )
    print("Final iteration result:", final_result)
    
    # Save the profile
    save_result = save_profile(preference_id, ai_id)
    print("Profile saved:", save_result)
    
    # Get the profile data
    profile = get_profile(preference_id, ai_id)
    print("Profile data:")
    print(json.dumps(profile, indent=2))

if __name__ == "__main__":
    main()
`}
                            </pre>
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="javascript" className="mt-4">
                        <ScrollArea className="h-[500px] rounded-md border">
                          <div className="bg-gray-50 p-4">
                            <pre className="font-mono text-sm whitespace-pre-wrap">
                              {`// Style API Client

const BASE_URL = "https://haider.techrealm.online/api";
const ACCESS_ID = "test_user_123";
const GENDER = "women"; // or "men"

// Check API health
async function checkHealth() {
  const response = await fetch(\`\${BASE_URL}\`);
  return response.json();
}

// Create a new preference
async function createPreference() {
  const response = await fetch(\`\${BASE_URL}/preference\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      access_id: ACCESS_ID,
      gender: GENDER
    })
  });
  return response.json();
}

// Process an iteration
async function processIteration(preferenceId, aiId, iteration, feedback, style = null, imageKey = null) {
  const payload = {
    feedback
  };
  
  // For the final iteration, include style and image_key
  if (iteration === 30) {
    payload.style = style;
    payload.image_key = imageKey;
  }
  
  const response = await fetch(\`\${BASE_URL}/preference/\${preferenceId}/iteration/\${iteration}\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "AI-ID": aiId
    },
    body: JSON.stringify(payload)
  });
  return response.json();
}

// Save profile
async function saveProfile(preferenceId, aiId) {
  const response = await fetch(\`\${BASE_URL}/preference/\${preferenceId}/profile\`, {
    method: "POST",
    headers: {
      "AI-ID": aiId
    }
  });
  return response.json();
}

// Get profile
async function getProfile(preferenceId, aiId) {
  const response = await fetch(\`\${BASE_URL}/preference/\${preferenceId}/profile\`, {
    headers: {
      "AI-ID": aiId
    }
  });
  return response.json();
}

// Example usage
async function main() {
  try {
    // Check API health
    const health = await checkHealth();
    console.log("API Health:", health);
    
    // Create preference
    const pref = await createPreference();
    const { preference_id, ai_id } = pref;
    console.log(\`Created preference: \${preference_id}, AI-ID: \${ai_id}\`);
    
    // Process first iteration
    let currentIteration = 1;
    let lastStyle = null;
    let lastImageKey = null;
    
    const result = await processIteration(preference_id, ai_id, currentIteration, "like");
    console.log(\`Iteration \${currentIteration} result:\`, result);
    
    // Save style and image_key
    lastStyle = result.style;
    lastImageKey = result.image_key;
    
    // In a real app, you would continue processing all 30 iterations...
    // For brevity, we'll jump to the final iteration
    
    // Process final iteration
    const finalResult = await processIteration(
      preference_id,
      ai_id,
      30, // Final iteration
      "like",
      lastStyle,
      lastImageKey
    );
    console.log("Final iteration result:", finalResult);
    
    // Save profile
    const saveResult = await saveProfile(preference_id, ai_id);
    console.log("Profile saved:", saveResult);
    
    // Get profile
    const profile = await getProfile(preference_id, ai_id);
    console.log("Profile data:", profile);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the example
main();
`}
                            </pre>
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="curl" className="mt-4">
                        <ScrollArea className="h-[500px] rounded-md border">
                          <div className="bg-gray-50 p-4">
                            <pre className="font-mono text-sm whitespace-pre-wrap">
                              {`#!/bin/bash

# Style API base URL
BASE_URL="https://haider.techrealm.online/api"

# Test credentials
ACCESS_ID="test_user_123"
GENDER="women"  # or "men"

# Check API health
echo "Checking API health..."
curl -s -X GET "$BASE_URL"
echo

# Create preference
echo "Creating preference..."
PREFERENCE_RESPONSE=$(curl -s -X POST "$BASE_URL/preference" \
  -H "Content-Type: application/json" \
  -d "{\"access_id\": \"$ACCESS_ID\", \"gender\": \"$GENDER\"}")
echo $PREFERENCE_RESPONSE

# Extract preference_id and ai_id
PREFERENCE_ID=$(echo $PREFERENCE_RESPONSE | grep -o '"preference_id":"[^"]*' | cut -d'"' -f4)
AI_ID=$(echo $PREFERENCE_RESPONSE | grep -o '"ai_id":"[^"]*' | cut -d'"' -f4)

echo "Preference ID: $PREFERENCE_ID"
echo "AI ID: $AI_ID"

# Process first iteration
echo "Processing iteration 1..."
ITERATION_RESPONSE=$(curl -s -X POST "$BASE_URL/preference/$PREFERENCE_ID/iteration/1" \
  -H "Content-Type: application/json" \
  -H "AI-ID: $AI_ID" \
  -d "{\"feedback\": \"like\"}")
echo $ITERATION_RESPONSE

# Extract style and image_key for later use
STYLE=$(echo $ITERATION_RESPONSE | grep -o '"style":"[^"]*' | cut -d'"' -f4)
IMAGE_KEY=$(echo $ITERATION_RESPONSE | grep -o '"image_key":"[^"]*' | cut -d'"' -f4)

echo "Style: $STYLE"
echo "Image Key: $IMAGE_KEY"

# In a real scenario, you would continue with iterations 2-29
# For brevity, we'll skip to iteration 30

# Process final iteration (30)
echo "Processing final iteration (30)..."
FINAL_RESPONSE=$(curl -s -X POST "$BASE_URL/preference/$PREFERENCE_ID/iteration/30" \
  -H "Content-Type: application/json" \
  -H "AI-ID: $AI_ID" \
  -d "{\"feedback\": \"like\", \"style\": \"$STYLE\", \"image_key\": \"$IMAGE_KEY\"}")
echo $FINAL_RESPONSE

# Save profile
echo "Saving profile..."
SAVE_RESPONSE=$(curl -s -X POST "$BASE_URL/preference/$PREFERENCE_ID/profile" \
  -H "AI-ID: $AI_ID")
echo $SAVE_RESPONSE

# Get profile
echo "Getting profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/preference/$PREFERENCE_ID/profile" \
  -H "AI-ID: $AI_ID")
echo $PROFILE_RESPONSE

echo "Process completed!"
`}
                            </pre>
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiDocs;
