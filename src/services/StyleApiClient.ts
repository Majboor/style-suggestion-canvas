
interface AuthResponse {
  preference_id: string;
  ai_id: string;
}

interface IterationResponse {
  image_url: string;
  iteration: number;
  completed: boolean;
  style?: string;
  image_key?: string;
}

interface ProfileResponse {
  top_styles: {
    [key: string]: number | [string, number] | { [key: string]: number };
  };
  selection_history: {
    image: string;
    style: string;
    feedback: "Like" | "Dislike";
    score_change: number;
    current_score: number;
    timestamp: number;
  }[];
}

interface SaveProfileResponse {
  message: string;
}

class StyleApiClient {
  private apiBaseUrl: string;
  private aiId: string | null;
  private preferenceId: string | null;
  private currentIteration: number;

  constructor(baseUrl: string = "https://haider.techrealm.online/api") {
    this.apiBaseUrl = baseUrl;
    this.aiId = localStorage.getItem("style_ai_id");
    this.preferenceId = localStorage.getItem("style_preference_id");
    
    // The iteration in local storage represents the current iteration we're on
    const storedIteration = localStorage.getItem("style_current_iteration");
    this.currentIteration = storedIteration ? parseInt(storedIteration) : 0;
    console.log(`StyleApiClient initialized with iteration: ${this.currentIteration}`);
  }

  get isAuthenticated(): boolean {
    return !!this.aiId && !!this.preferenceId;
  }

  setSessionData(aiId: string, preferenceId: string) {
    this.aiId = aiId;
    this.preferenceId = preferenceId;
    this.currentIteration = 0; // Reset to 0 on new session creation
    localStorage.setItem("style_ai_id", aiId);
    localStorage.setItem("style_preference_id", preferenceId);
    localStorage.setItem("style_current_iteration", "0");
    console.log("Session data set, iteration reset to 0");
  }

  clearSessionData() {
    this.aiId = null;
    this.preferenceId = null;
    this.currentIteration = 0;
    localStorage.removeItem("style_ai_id");
    localStorage.removeItem("style_preference_id");
    localStorage.removeItem("style_current_iteration");
    console.log("Session data cleared");
  }

  getAiId(): string | null {
    return this.aiId;
  }

  getPreferenceId(): string | null {
    return this.preferenceId;
  }

  getCurrentIteration(): number {
    return this.currentIteration;
  }

  setCurrentIteration(iteration: number) {
    this.currentIteration = iteration;
    localStorage.setItem("style_current_iteration", this.currentIteration.toString());
    console.log(`Current iteration set to: ${this.currentIteration}`);
  }

  async authenticate(accessId: string, gender: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/preference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ access_id: accessId, gender }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Authentication failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data: AuthResponse = await response.json();
      this.setSessionData(data.ai_id, data.preference_id);
      return data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  async submitFeedbackAndGetNextImage(feedback?: "like" | "dislike", style?: string, imageKey?: string): Promise<IterationResponse> {
    if (!this.aiId || !this.preferenceId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      // If we're already at iteration 30 or more, we shouldn't make additional calls
      if (this.currentIteration >= 30) {
        console.log("Maximum iterations reached (30). Not making additional API calls.");
        return {
          image_url: "",
          iteration: this.currentIteration,
          completed: true
        };
      }
      
      // Calculate the next iteration number (from 1-30)
      // For first call (iteration 0), we should request iteration 1
      const nextIteration = this.currentIteration === 0 ? 1 : this.currentIteration + 1;
      
      // Make sure we're not exceeding the limit
      if (nextIteration > 30) {
        console.log(`Invalid iteration number: ${nextIteration}, max is 30`);
        return {
          image_url: "",
          iteration: 30,
          completed: true
        };
      }
      
      // Default to dislike if no feedback provided (for first call)
      const feedbackValue = feedback || "dislike";
      
      console.log(`Submitting feedback for iteration ${nextIteration}: ${feedbackValue}`);
      
      // Prepare the request body
      const requestBody: any = { feedback: feedbackValue };
      
      // For the final iteration, include style and image_key if provided
      if (nextIteration === 30 && style && imageKey) {
        requestBody.style = style;
        requestBody.image_key = imageKey;
      }
      
      console.log(`Making API request to ${this.apiBaseUrl}/preference/${this.preferenceId}/iteration/${nextIteration}`);
      
      // Call the API with the next iteration number
      try {
        const response = await fetch(
          `${this.apiBaseUrl}/preference/${this.preferenceId}/iteration/${nextIteration}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "AI-ID": this.aiId,
            },
            body: JSON.stringify(requestBody),
          }
        );

        // Handle "No more images available" error by treating it as completion
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.error === "No more images available") {
            console.log("No more images available - marking as completed");
            this.setCurrentIteration(30); // Set to max iteration
            return {
              image_url: "",
              iteration: 30,
              completed: true
            };
          } else if (errorData.error === "Invalid iteration ID") {
            console.log("Invalid iteration ID - resetting to iteration 1");
            // Reset to iteration 1 and try again
            this.setCurrentIteration(0);
            return this.submitFeedbackAndGetNextImage(feedback, style, imageKey);
          }
          throw new Error(`Failed to submit feedback: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(`Failed to submit feedback: ${response.status} - ${errorResponse.error || 'Unknown error'}`);
        }

        const data: IterationResponse = await response.json();
        console.log(`Response from API:`, data);
        
        // Update our current iteration to what the API returned
        this.setCurrentIteration(data.iteration);
        
        // Set completed flag if we've reached 30 iterations
        const isCompleted = data.iteration >= 30;
        return {
          ...data,
          completed: isCompleted
        };
      } catch (error) {
        // Check if the error message indicates "No more images available"
        if (error instanceof Error && error.message.includes("No more images available")) {
          console.log("No more images available - marking as completed");
          this.setCurrentIteration(30); // Set to max iteration
          return {
            image_url: "",
            iteration: 30,
            completed: true
          };
        }
        throw error;
      }
    } catch (error) {
      console.error("Error submitting feedback or getting next image:", error);
      throw error;
    }
  }

  async saveProfile(): Promise<SaveProfileResponse> {
    if (!this.aiId || !this.preferenceId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/preference/${this.preferenceId}/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "AI-ID": this.aiId,
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`Failed to save profile: ${response.status} - ${errorResponse.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("Save profile response:", data);
      return data;
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    if (!this.aiId || !this.preferenceId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      // Add delay to ensure API has time to process recent feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(
        `${this.apiBaseUrl}/preference/${this.preferenceId}/profile`,
        {
          method: "GET",
          headers: {
            "AI-ID": this.aiId,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          console.log("Profile not available yet. Returning default empty profile.");
          return {
            top_styles: {},
            selection_history: []
          };
        }
        
        const errorResponse = await response.json();
        throw new Error(`Failed to get profile: ${response.status} - ${errorResponse.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("Get profile response:", data);
      return data;
    } catch (error) {
      console.error("Error getting profile:", error);
      
      return {
        top_styles: {},
        selection_history: []
      };
    }
  }

  async checkApiHealth(): Promise<{status: string}> {
    try {
      const response = await fetch(this.apiBaseUrl);
      if (!response.ok) {
        throw new Error("API health check failed");
      }
      return await response.json();
    } catch (error) {
      console.error("API health check failed:", error);
      throw error;
    }
  }
}

const styleApiClient = new StyleApiClient();
export default styleApiClient;
