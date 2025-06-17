
import { useCallback } from 'react';

export interface Intent {
  name: string;
  keywords: string[];
  priority: number;
}

const intents: Intent[] = [
  {
    name: 'weather',
    keywords: ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy', 'hot', 'cold', 'humid'],
    priority: 1
  },
  {
    name: 'news',
    keywords: ['news', 'headlines', 'breaking', 'latest', 'current events', 'happening'],
    priority: 1
  },
  {
    name: 'traffic',
    keywords: ['traffic', 'road', 'commute', 'drive', 'route', 'highway', 'congestion'],
    priority: 1
  },
  {
    name: 'sports',
    keywords: ['game', 'score', 'team', 'win', 'lose', 'match', 'sports', 'football', 'basketball', 'baseball'],
    priority: 1
  },
  {
    name: 'general',
    keywords: [],
    priority: 0
  }
];

export const useIntentRecognition = () => {
  const detectIntent = useCallback((text: string): string => {
    const lowerText = text.toLowerCase();
    let bestIntent = 'general';
    let bestScore = 0;

    for (const intent of intents) {
      if (intent.name === 'general') continue;
      
      let score = 0;
      for (const keyword of intent.keywords) {
        if (lowerText.includes(keyword)) {
          score += intent.priority;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent.name;
      }
    }

    console.log(`Intent detected: ${bestIntent} (score: ${bestScore}) for: "${text}"`);
    return bestIntent;
  }, []);

  return { detectIntent };
};
