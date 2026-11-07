import { soundEffects } from './soundEffects';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n/languages';

export type CoachPersona = 'drona' | 'acharya' | 'guru';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

type VoiceStatusListener = (status: {
  isSpeaking: boolean;
  isListening: boolean;
  text: string;
  amplitude: number;
  language: SupportedLanguage;
}) => void;

type VoiceCommandListener = (command: string, rawTranscript: string) => void;

class VoiceCoachManager {
  private synth: SpeechSynthesis | null = null;
  private recognition: SpeechRecognitionInstance | null = null;
  private isVoiceEnabled: boolean = true;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private currentSpokenText: string = '';
  private language: SupportedLanguage = 'en';
  private persona: CoachPersona = 'drona';
  private statusListeners: Set<VoiceStatusListener> = new Set();
  private commandListeners: Set<VoiceCommandListener> = new Set();
  private animInterval: number | null = null;
  private currentAmplitude: number = 0;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
      this.initRecognition();
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    try {
      const v = this.synth.getVoices();
      if (v && v.length > 0) {
        this.cachedVoices = v;
      }
    } catch {
      // Ignore if unavailable
    }
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.updateRecognitionLanguage();

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          const last = event.results.length - 1;
          const transcript = event.results[last][0].transcript.trim().toLowerCase();
          this.handleRecognizedSpeech(transcript);
        };

        this.recognition.onerror = () => {
          this.setListening(false);
        };

        this.recognition.onend = () => {
          this.setListening(false);
        };
      } catch {
        // Recognition not supported
      }
    }
  }

  private updateRecognitionLanguage() {
    if (!this.recognition) return;
    const meta = SUPPORTED_LANGUAGES.find((l) => l.code === this.language);
    this.recognition.lang = meta ? meta.speechCode : 'en-IN';
  }

  public subscribeStatus(listener: VoiceStatusListener): () => void {
    this.statusListeners.add(listener);
    listener({
      isSpeaking: this.isSpeaking,
      isListening: this.isListening,
      text: this.currentSpokenText,
      amplitude: this.currentAmplitude,
      language: this.language,
    });
    return () => this.statusListeners.delete(listener);
  }

  public subscribeCommand(listener: VoiceCommandListener): () => void {
    this.commandListeners.add(listener);
    return () => this.commandListeners.delete(listener);
  }

  private notifyStatus() {
    const status = {
      isSpeaking: this.isSpeaking,
      isListening: this.isListening,
      text: this.currentSpokenText,
      amplitude: this.currentAmplitude,
      language: this.language,
    };
    this.statusListeners.forEach((l) => l(status));
  }

  public setLanguage(lang: SupportedLanguage) {
    this.language = lang;
    this.updateRecognitionLanguage();
    this.notifyStatus();
  }

  public getLanguage(): SupportedLanguage {
    return this.language;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    if (!enabled) {
      this.stopSpeaking();
      this.stopListening();
    }
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  public setPersona(persona: CoachPersona) {
    this.persona = persona;
  }

  public getPersona(): CoachPersona {
    return this.persona;
  }

  public speak(text: string, priority: 'normal' | 'urgent' = 'normal') {
    if (!this.isVoiceEnabled || !this.synth) return;

    if (priority === 'urgent') {
      this.synth.cancel();
    } else if (this.isSpeaking) {
      return;
    }

    try {
      const cleaned = text
        .replace(/[*_#`[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      const availableVoices = this.cachedVoices.length > 0 ? this.cachedVoices : this.synth.getVoices();

      // Deep resonant masculine guru pitch & measured coach pace
      utterance.pitch = 0.78;
      utterance.rate = 0.94;

      const meta = SUPPORTED_LANGUAGES.find((l) => l.code === this.language);
      const targetSpeechCode = meta ? meta.speechCode.toLowerCase() : 'en-in';
      const langPrefix = this.language.toLowerCase();

      // Disqualify any voice matching known female names or tokens
      const FEMALE_TOKENS = [
        'female', 'woman', 'girl', 'zira', 'samantha', 'victoria', 'karen', 'susan', 
        'heera', 'swara', 'kalpana', 'geeta', 'anjali', 'priya', 'kavita', 'neerja', 
        'shruti', 'sunita', 'eva', 'hazel', 'catherine', 'linda', 'amy', 'emma', 
        'serena', 'fiona', 'moira', 'veena', 'leena', 'sangeeta', 'chitra', 'lekha', 
        'aditi', 'tessa', 'vani', 'maya', 'pooja', 'diya', 'ria', 'ananya', 'shreya',
        'radha', 'meera', 'deepa', 'usha', 'aarti', 'jyoti', 'rekha', 'sapna',
        'natasha', 'alva', 'stephanie', 'jenny', 'siri female'
      ];

      const isFemale = (v: SpeechSynthesisVoice) => {
        const lower = `${v.name} ${v.lang}`.toLowerCase();
        return FEMALE_TOKENS.some((tok) => lower.includes(tok));
      };

      // Prioritize Indian Male voices and masculine names
      const MALE_INDIAN_TOKENS = [
        'ravi', 'mohan', 'prabhat', 'madhav', 'rishi', 'valluvar', 'arun', 'raj', 
        'vijay', 'amit', 'ajay', 'sanjay', 'vikram', 'karan', 'rohit', 'rahul', 
        'suraj', 'manoj', 'anil', 'sunil', 'deepak', 'ramesh', 'suresh', 'ganesh',
        'krishna', 'shiva', 'harish', 'mahesh', 'naresh', 'dinesh', 'ashok', 'alok',
        'tem', 'tam', 'knm', 'mlm', 'bnm', 'odm', 'him', 'hie', 'hid', 'ene', 'end'
      ];

      const MALE_GENERAL_TOKENS = [
        'male', 'guy', 'david', 'george', 'alex', 'daniel', 'james', 'oliver', 
        'tom', 'charles', 'mark', 'john', 'michael', 'richard', 'william', 'thomas',
        'brian', 'arthur', 'nathan', 'ryan', 'paul', 'man'
      ];

      const isMaleIndian = (v: SpeechSynthesisVoice) => {
        const lower = `${v.name} ${v.lang}`.toLowerCase();
        return MALE_INDIAN_TOKENS.some((tok) => lower.includes(tok));
      };

      const isMaleGeneral = (v: SpeechSynthesisVoice) => {
        const lower = `${v.name} ${v.lang}`.toLowerCase();
        return MALE_GENERAL_TOKENS.some((tok) => lower.includes(tok));
      };

      // Scoring candidate voices
      let chosenVoice: SpeechSynthesisVoice | null = null;
      let highestScore = -999;

      for (const v of availableVoices) {
        if (isFemale(v)) continue;

        let score = 0;
        const vLang = v.lang.toLowerCase();
        const matchesTargetLang = vLang.startsWith(langPrefix) || vLang === targetSpeechCode;
        const isIndiaRegion = vLang.includes('-in') || vLang.includes('_in') || v.name.toLowerCase().includes('india');

        if (matchesTargetLang) score += 60;
        if (isIndiaRegion) score += 30;
        if (isMaleIndian(v)) score += 50;
        else if (isMaleGeneral(v)) score += 25;

        if (score > highestScore) {
          highestScore = score;
          chosenVoice = v;
        }
      }

      // Fallback: If no voice matched from score loop, pick any non-female male voice
      if (!chosenVoice) {
        chosenVoice = availableVoices.find((v) => !isFemale(v) && (isMaleIndian(v) || isMaleGeneral(v))) || null;
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      } else {
        utterance.lang = targetSpeechCode;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.currentSpokenText = cleaned;
        this.startVoicePulse();
        this.notifyStatus();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentSpokenText = '';
        this.stopVoicePulse();
        this.notifyStatus();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentSpokenText = '';
        this.stopVoicePulse();
        this.notifyStatus();
      };

      this.synth.speak(utterance);
    } catch {
      this.isSpeaking = false;
      this.stopVoicePulse();
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentSpokenText = '';
    this.stopVoicePulse();
    this.notifyStatus();
  }

  public toggleListening(): boolean {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      return this.startListening();
    }
  }

  public startListening(): boolean {
    if (!this.recognition) return false;
    try {
      this.stopSpeaking();
      soundEffects.playVoiceChime();
      this.updateRecognitionLanguage();
      this.recognition.start();
      this.setListening(true);
      return true;
    } catch {
      this.setListening(false);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Safe ignore
      }
    }
    this.setListening(false);
  }

  private setListening(listening: boolean) {
    this.isListening = listening;
    if (listening) {
      this.startListeningPulse();
    } else {
      this.stopVoicePulse();
    }
    this.notifyStatus();
  }

  private startVoicePulse() {
    if (this.animInterval) clearInterval(this.animInterval);
    this.animInterval = window.setInterval(() => {
      this.currentAmplitude = 0.3 + Math.random() * 0.7;
      this.notifyStatus();
    }, 120);
  }

  private startListeningPulse() {
    if (this.animInterval) clearInterval(this.animInterval);
    this.animInterval = window.setInterval(() => {
      this.currentAmplitude = 0.2 + Math.random() * 0.4;
      this.notifyStatus();
    }, 150);
  }

  private stopVoicePulse() {
    if (this.animInterval) {
      clearInterval(this.animInterval);
      this.animInterval = null;
    }
    this.currentAmplitude = 0;
  }

  private handleRecognizedSpeech(transcript: string) {
    soundEffects.playVoiceChime();

    let command = transcript;
    if (
      transcript.includes('hint') ||
      transcript.includes('help') ||
      transcript.includes('suggest') ||
      transcript.includes('सलाह') ||
      transcript.includes('సూచన') ||
      transcript.includes('குறிப்பு') ||
      transcript.includes('ಸುಳಿವು')
    ) {
      command = 'hint';
    } else if (
      transcript.includes('undo') ||
      transcript.includes('take back') ||
      transcript.includes('वापस') ||
      transcript.includes('వెనక్కి')
    ) {
      command = 'undo';
    } else if (
      transcript.includes('how am i doing') ||
      transcript.includes('evaluation') ||
      transcript.includes('analyze') ||
      transcript.includes('status') ||
      transcript.includes('स्थिति') ||
      transcript.includes('విలువ')
    ) {
      command = 'evaluate';
    } else if (transcript.includes('castle') || transcript.includes('राजा')) {
      command = 'O-O';
    } else if (
      transcript.includes('restart') ||
      transcript.includes('new game') ||
      transcript.includes('नया') ||
      transcript.includes('కొత్త')
    ) {
      command = 'restart';
    }

    this.commandListeners.forEach((l) => l(command, transcript));
  }
}

export const voiceCoach = new VoiceCoachManager();
