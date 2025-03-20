
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import styleApiClient from "@/services/StyleApiClient";

interface ImageCardProps {
  imageUrl: string;
  iteration: number;
  isCompleted: boolean;
  onFeedbackSubmitted: (newImageUrl?: string, newIteration?: number) => void;
  autoSaveOnCompletion?: boolean;
}

const ImageCard = ({ 
  imageUrl, 
  iteration, 
  isCompleted, 
  onFeedbackSubmitted,
  autoSaveOnCompletion = true
}: ImageCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentStyle, setCurrentStyle] = useState<string | undefined>(undefined);
  const [currentImageKey, setCurrentImageKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Reset image loaded state when URL changes
    setImageLoaded(false);
    // Reset feedback state when iteration changes
    setFeedback(null);
    // Reset retry count when iteration changes
    setRetryCount(0);
  }, [imageUrl, iteration]);

  useEffect(() => {
    // Auto-save profile when iterations are completed
    if (isCompleted && autoSaveOnCompletion) {
      const saveProfile = async () => {
        try {
          await styleApiClient.saveProfile();
          toast.success("Profile automatically saved", {
            description: "Your style preferences have been saved.",
          });
        } catch (error) {
          console.error("Error auto-saving profile:", error);
          toast.error("Failed to auto-save profile", {
            description: "Please try saving manually.",
          });
        }
      };
      
      saveProfile();
    }
  }, [isCompleted, autoSaveOnCompletion]);

  const handleFeedback = async (type: 'like' | 'dislike') => {
    if (isLoading) return; // Prevent multiple submissions while loading
    if (!imageUrl) {
      toast.error("No image to rate", {
        description: "Please load an image first."
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setFeedback(type);
      
      // Only make API call if not already completed
      if (!isCompleted) {
        try {
          // Pass style and image_key when submitting feedback for the last iteration
          const response = await styleApiClient.submitFeedbackAndGetNextImage(
            type, 
            iteration === 29 ? currentStyle : undefined, 
            iteration === 29 ? currentImageKey : undefined
          );
          
          toast.success(`You ${type}d this style`, {
            description: "Your preferences have been updated.",
          });
          
          // Save the style and image_key for potential use in the next iteration
          if (response.style) {
            setCurrentStyle(response.style);
          }
          
          if (response.image_key) {
            setCurrentImageKey(response.image_key);
          }
          
          // If the API returned an empty URL but marked it as completed,
          // we should notify but not update the image
          if (!response.image_url && response.completed) {
            toast.info("No more images available", {
              description: "You've completed all available iterations.",
            });
            
            // Wait a bit before notifying parent with completion status
            setTimeout(() => {
              onFeedbackSubmitted(undefined, response.iteration);
            }, 750);
            return;
          }
          
          // Wait a bit before notifying parent with the new image data
          setTimeout(() => {
            onFeedbackSubmitted(response.image_url, response.iteration);
          }, 750);
        } catch (error) {
          // If we got a "No more images" error, handle it specially
          if (error instanceof Error && error.message.includes("No more images available")) {
            toast.info("No more images available", {
              description: "You've completed all available iterations.",
            });
            
            // Notify parent that we're done
            setTimeout(() => {
              onFeedbackSubmitted(undefined, 30);
            }, 750);
            return;
          }
          
          throw error; // Re-throw for the catch block below
        }
      } else {
        // Still notify parent for completion case
        setTimeout(() => {
          onFeedbackSubmitted();
        }, 750);
      }
    } catch (error) {
      console.error(`Error submitting ${type}:`, error);
      setFeedback(null);
      
      // If we've already retried a few times, show a more detailed error
      if (retryCount >= 2) {
        toast.error(`Failed to submit feedback`, {
          description: "There seems to be an issue with the API. Please try again later.",
        });
      } else {
        toast.error(`Failed to submit feedback`, {
          description: "Please try again.",
          action: {
            label: "Retry",
            onClick: () => {
              setRetryCount(prev => prev + 1);
              handleFeedback(type);
            }
          }
        });
      }
      
      // Notify parent of error
      onFeedbackSubmitted();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg w-full max-w-md mx-auto animate-appear">
      <div className="relative w-full pb-[125%]">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse flex space-x-2">
              <Loader2 className="h-8 w-8 text-apple-blue animate-spin" />
            </div>
          </div>
        )}
        
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Style suggestion" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              toast.error("Failed to load image", {
                description: "Please try refreshing the page."
              });
            }}
          />
        )}
        
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Iteration {iteration}/30
          </span>
        </div>
        
        {currentStyle && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Style: {currentStyle}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex justify-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          className={`transition-all-200 ${feedback === 'dislike' ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
          disabled={isLoading || isCompleted || !imageUrl}
          onClick={() => handleFeedback('dislike')}
        >
          {isLoading && feedback === 'dislike' ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <ThumbsDown className="h-4 w-4 mr-1" />
          )}
          Dislike
        </Button>
        
        <Button 
          size="sm" 
          className={`transition-all-200 bg-apple-blue hover:bg-apple-blue-light text-white ${feedback === 'like' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          disabled={isLoading || isCompleted || !imageUrl}
          onClick={() => handleFeedback('like')}
        >
          {isLoading && feedback === 'like' ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <ThumbsUp className="h-4 w-4 mr-1" />
          )}
          Like
        </Button>
      </div>
    </Card>
  );
};

export default ImageCard;
