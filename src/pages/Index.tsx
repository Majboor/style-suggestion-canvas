import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ImageIcon, 
  BookText,
  ArrowRight,
  Github
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Style API Project</h1>
            <div className="flex items-center gap-4">
              <Link to="/style-api">
                <Button variant="outline" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Style API Tester
                </Button>
              </Link>
              <Link to="/api-docs">
                <Button variant="outline" className="flex items-center gap-2">
                  <BookText className="h-4 w-4" />
                  API Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Style Preference API</h2>
            <p className="text-lg text-gray-600 mb-6">
              Build personalized style profiles through iterative user feedback.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/style-api">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Try the Style API
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/api-docs">
                <Button size="lg" variant="outline">
                  View API Documentation
                  <BookText className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <Separator className="my-12" />

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                  Style API Tester
                </CardTitle>
                <CardDescription>
                  Interactive tool to test and experiment with the Style API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Use our visual interface to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Create style preference profiles</li>
                  <li>Rate fashion suggestions</li>
                  <li>View your style profile results</li>
                  <li>Test the full API workflow</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/style-api" className="w-full">
                  <Button className="w-full">Go to Style API Tester</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookText className="h-5 w-5 text-blue-500" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  Complete documentation for integrators and developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our documentation includes:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Detailed API endpoints</li>
                  <li>Authentication instructions</li>
                  <li>Request/response examples</li>
                  <li>Code samples in multiple languages</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/api-docs" className="w-full">
                  <Button variant="outline" className="w-full">View API Documentation</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">About This Project</h3>
            <p className="text-gray-600">
              This project demonstrates a style preference API that builds user fashion profiles through an iterative process.
              Users rate fashion images, and the system learns their preferences to create a personalized style profile.
            </p>
            <div className="flex justify-center mt-6">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 text-sm">
            Style API Project • Made by techrealm.pk • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
