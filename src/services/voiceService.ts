/**
 * MediGrid Voice & Accessibility Service
 * Provides Speech-to-Text (STT) and Text-to-Speech (TTS) using Web Speech APIs
 * with graceful fallbacks and language voice matching.
 */

// Types for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export interface SpeechRecognitionResultWrapper {
  transcript: string;
  isFinal: boolean;
}

export class VoiceAssistantService {
  private recognition: any = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognition = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  public isSpeechInputAvailable(): boolean {
    return Boolean(this.recognition);
  }

  public isSpeechOutputAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Start listening to user speech in specified language code
   */
  public startListening(
    langCode: string,
    onResult: (result: SpeechRecognitionResultWrapper) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. Please use text input.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      // Map ISO code to BCP 47 locale (e.g. 'en' -> 'en-IN' or 'en-US', 'hi' -> 'hi-IN', 'mr' -> 'mr-IN')
      const localeMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        gu: 'gu-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        pa: 'pa-IN',
        ur: 'ur-PK',
        ar: 'ar-SA',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        zh: 'zh-CN',
        ja: 'ja-JP',
        ru: 'ru-RU',
      };

      this.recognition.lang = localeMap[langCode] || langCode;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        onResult({
          transcript: finalTranscript || interimTranscript,
          isFinal: Boolean(finalTranscript),
        });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error === 'not-allowed' ? 'Microphone permission denied' : `Audio capture: ${event.error}`);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e: any) {
      this.isListening = false;
      onError(e.message || 'Error initializing microphone capture');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }

  /**
   * Speak response using Text-to-Speech
   */
  public speak(
    text: string,
    langCode: string,
    speed: number = 1.0,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (!this.isSpeechOutputAvailable()) {
      return false;
    }

    this.stopSpeaking();

    try {
      const cleanText = text
        .replace(/[*_#`[\]()]/g, '') // remove markdown symbols
        .replace(/\n+/g, ' ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = Math.max(0.5, Math.min(2.0, speed));
      utterance.pitch = 1.0;

      const localeMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        ar: 'ar-SA',
        zh: 'zh-CN',
      };
      const targetLocale = localeMap[langCode] || langCode;
      utterance.lang = targetLocale;

      // Try to find native voice
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang.startsWith(langCode) || v.lang.startsWith(targetLocale));
      if (match) {
        utterance.voice = match;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (onError) onError(e);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }

  public stopSpeaking(): void {
    if (this.isSpeechOutputAvailable()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}

export const voiceAssistant = new VoiceAssistantService();
