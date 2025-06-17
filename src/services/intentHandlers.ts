
interface WeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  name: string;
}

interface NewsResponse {
  articles: Array<{
    title: string;
    description: string;
    source: { name: string };
  }>;
}

export class IntentHandlers {
  private weatherApiKey: string;
  private newsApiKey: string;

  constructor(weatherApiKey: string, newsApiKey: string) {
    this.weatherApiKey = weatherApiKey;
    this.newsApiKey = newsApiKey;
  }

  async handleWeather(query: string): Promise<string> {
    try {
      // Extract location from query or use default
      const location = this.extractLocation(query) || 'New York';
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${this.weatherApiKey}&units=imperial`
      );
      
      if (!response.ok) {
        throw new Error('Weather data unavailable');
      }
      
      const data: WeatherResponse = await response.json();
      
      return `The weather in ${data.name} is ${data.weather[0].description} with a temperature of ${Math.round(data.main.temp)} degrees Fahrenheit. It feels like ${Math.round(data.main.feels_like)} degrees.`;
    } catch (error) {
      console.error('Weather error:', error);
      return "I'm sorry, I couldn't get the weather information right now.";
    }
  }

  async handleNews(): Promise<string> {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&pageSize=3&apiKey=${this.newsApiKey}`
      );
      
      if (!response.ok) {
        throw new Error('News data unavailable');
      }
      
      const data: NewsResponse = await response.json();
      
      if (data.articles.length === 0) {
        return "I couldn't find any news stories right now.";
      }
      
      const headlines = data.articles
        .slice(0, 3)
        .map(article => `${article.title} from ${article.source.name}`)
        .join('. ');
      
      return `Here are the top news headlines: ${headlines}`;
    } catch (error) {
      console.error('News error:', error);
      return "I'm sorry, I couldn't get the news right now.";
    }
  }

  async handleTraffic(query: string): Promise<string> {
    // For now, return a generic traffic response
    // In a real implementation, you'd use Google Maps API or similar
    const location = this.extractLocation(query) || 'your area';
    return `I don't have real-time traffic data available right now, but I recommend checking your preferred maps app for current traffic conditions in ${location}.`;
  }

  async handleSports(query: string): Promise<string> {
    // For now, return a generic sports response
    // In a real implementation, you'd use ESPN API or similar
    return "I don't have access to current sports scores right now, but I recommend checking ESPN or your favorite sports app for the latest results.";
  }

  private extractLocation(query: string): string | null {
    // Simple location extraction - could be improved with NLP
    const locationKeywords = ['in ', 'for ', 'at '];
    const lowerQuery = query.toLowerCase();
    
    for (const keyword of locationKeywords) {
      const index = lowerQuery.indexOf(keyword);
      if (index !== -1) {
        const afterKeyword = query.substring(index + keyword.length).trim();
        const words = afterKeyword.split(' ');
        if (words.length > 0 && words[0].length > 2) {
          return words[0];
        }
      }
    }
    
    return null;
  }
}
