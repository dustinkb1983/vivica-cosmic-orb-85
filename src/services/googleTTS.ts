
interface GoogleTTSOptions {
  apiKey: string;
  voice?: string;
  languageCode?: string;
  ssmlGender?: 'NEUTRAL' | 'FEMALE' | 'MALE';
  audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
}

export class GoogleTTSService {
  private apiKey: string;
  private voice: string;
  private languageCode: string;
  private ssmlGender: 'NEUTRAL' | 'FEMALE' | 'MALE';
  private audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';

  constructor(options: GoogleTTSOptions) {
    this.apiKey = options.apiKey;
    this.voice = options.voice || 'en-US-Standard-E';
    this.languageCode = options.languageCode || 'en-US';
    this.ssmlGender = options.ssmlGender || 'FEMALE';
    this.audioEncoding = options.audioEncoding || 'MP3';
  }

  async synthesize(text: string): Promise<string> {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
    
    const requestBody = {
      input: { text },
      voice: {
        languageCode: this.languageCode,
        name: this.voice,
        ssmlGender: this.ssmlGender
      },
      audioConfig: {
        audioEncoding: this.audioEncoding,
        speakingRate: 1.0,
        pitch: 0.0
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google TTS error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.audioContent; // Base64 encoded audio
  }

  async playAudio(audioContent: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioBlob = new Blob([
          Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))
        ], { type: 'audio/mp3' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        
        audio.play();
      } catch (error) {
        reject(error);
      }
    });
  }
}
