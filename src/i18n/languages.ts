export type SupportedLanguage = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml' | 'bn' | 'or';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'or-IN' },
];

export interface TranslationDict {
  appTitle: string;
  appSubtitle: string;
  guruDrona: string;
  modePlay: string;
  modeCoach: string;
  coachHint: string;
  askDrona: string;
  difficulty: string;
  white: string;
  black: string;
  yourTurn: string;
  aiThinking: string;
  undo: string;
  flip: string;
  restart: string;
  opening: string;
  moves: string;
  posEval: string;
  evaluation: string;
  brilliant: string;
  bestMove: string;
  excellent: string;
  good: string;
  inaccuracy: string;
  mistake: string;
  blunder: string;
  showAlternative: string;
  hideAlternative: string;
  alternativeMove: string;
  playMatch: string;
  openings: string;
  endgames: string;
  trainingPlan: string;
  analytics: string;
  settings: string;
  victory: string;
  defeat: string;
  draw: string;
  newGameStarted: string;
  welcomeVoice: string;
  hintDefault: string;
}

// UI Buttons & Labels are preserved in clean English as requested ("Voice translation should in languages not app letters")
// The Indian language is spoken out loud by Dr. Drona's voice agent and displayed in the coaching advice quotes
const baseEnglishUI: Omit<TranslationDict, 'welcomeVoice' | 'hintDefault'> = {
  appTitle: 'Dr. Drona',
  appSubtitle: 'AI Voice Chess Master & Guru',
  guruDrona: 'Guru Drona',
  modePlay: 'Match Mode',
  modeCoach: 'Coach Mode',
  coachHint: 'Hint',
  askDrona: 'Ask Drona',
  difficulty: 'Difficulty',
  white: 'White',
  black: 'Black',
  yourTurn: 'Your Turn',
  aiThinking: 'Drona is calculating...',
  undo: 'Undo',
  flip: 'Flip Board',
  restart: 'Restart',
  opening: 'Opening',
  moves: 'Moves',
  posEval: 'Eval',
  evaluation: 'Position Eval',
  brilliant: 'Brilliant !!',
  bestMove: 'Best Move ★',
  excellent: 'Excellent',
  good: 'Good',
  inaccuracy: 'Inaccuracy ?!',
  mistake: 'Mistake ?',
  blunder: 'Blunder ??',
  showAlternative: 'Show Better Move',
  hideAlternative: 'Hide Move',
  alternativeMove: 'Better Move',
  playMatch: 'Play',
  openings: 'Openings',
  endgames: 'Endgames',
  trainingPlan: 'Training',
  analytics: 'Analytics',
  settings: 'Settings',
  victory: 'Victory! Well played.',
  defeat: 'Game over. Let us analyze and improve.',
  draw: 'Match drawn.',
  newGameStarted: 'New match started. Control the center, protect your King, and play with courage!',
};

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDict> = {
  en: {
    ...baseEnglishUI,
    welcomeVoice: 'Greetings! I am Guru Drona. I will guide you on the board.',
    hintDefault: 'Look to control the center, develop knights and bishops, and ensure king safety.',
  },
  te: {
    ...baseEnglishUI,
    welcomeVoice: 'నమస్కారం! నేను గురు ద్రోణుడిని. చదరంగపు వ్యూహాలలో మీకు తోడుగా ఉంటాను.',
    hintDefault: 'కేంద్ర చతురస్రాలను ఆధీనంలోకి తెచ్చుకోండి, గుర్రాలను ముందుగా ముందుకు నడపండి.',
  },
  hi: {
    ...baseEnglishUI,
    welcomeVoice: 'नमस्ते! मैं गुरु द्रोणा हूँ। मैं शतरंज के इस खेल में आपका मार्गदर्शन करूँगा।',
    hintDefault: 'केंद्र के वर्गों पर नियंत्रण रखें, अपने घोड़ों और ऊंटों को बाहर निकालें।',
  },
  ta: {
    ...baseEnglishUI,
    welcomeVoice: 'வணக்கம்! நான் குரு துரோணா. உங்கள் சதுரங்க ஆட்டத்திற்கு வழிகாட்டுவேன்.',
    hintDefault: 'மையக் கட்டங்களைக் கட்டுப்படுத்துங்கள், குதிரைகளையும் மந்திரிகளையும் வளர்த்தெடுங்கள்.',
  },
  kn: {
    ...baseEnglishUI,
    welcomeVoice: 'ನಮಸ್ಕಾರ! ನಾನು ಗುರು ದ್ರೋಣ. ಚದುರಂಗದ ಯುದ್ಧಭೂಮಿಯಲ್ಲಿ ನಾನು ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಕ.',
    hintDefault: 'ಕೇಂದ್ರ ಸ್ಥಾನಗಳ ಮೇಲೆ ಹಿಡಿತ ಸಾಧಿಸಿ, ಕುದುರೆ ಮತ್ತು ಆನೆಗಳನ್ನು ಬೇಗನೆ ಮುನ್ನಡೆಸಿ.',
  },
  ml: {
    ...baseEnglishUI,
    welcomeVoice: 'നമസ്കാരം! ഞാൻ ഗുരു ദ്രോണനാണ്. ചെസ്സിൽ ഞാൻ നിങ്ങളെ നയിക്കും.',
    hintDefault: 'സെന്റർ നിയന്ത്രണം നിലനിർത്തുക, കുതിരകളെയും ആനകളെയും വിന്യസിക്കുക.',
  },
  bn: {
    ...baseEnglishUI,
    welcomeVoice: 'নমস্কার! আমি গুরু দ্রোণা। দাবার বোর্ডে আমি আপনার পথপ্রদর্শক।',
    hintDefault: 'কেন্দ্রের ঘরগুলি নিয়ন্ত্রণ করুন, ঘোড়া ও হাতিকে আগে বের করুন।',
  },
  or: {
    ...baseEnglishUI,
    welcomeVoice: 'ନମସ୍କାର! ମୁଁ ଗୁରୁ ଦ୍ରୋଣ। ଚେସ୍ ଯୁଦ୍ଧରେ ମୁଁ ଆପଣଙ୍କ ମାର୍ଗଦର୍ଶକ।',
    hintDefault: 'କେନ୍ଦ୍ରୀୟ ବର୍ଗକୁ ନିୟନ୍ତ୍ରଣ କରନ୍ତୁ, ଘୋଡ଼ା ଏବଂ ହାତୀକୁ ଆଗକୁ ବଢ଼ାନ୍ତୁ।',
  },
};

/**
 * Returns translated coaching voice feedback for any move classification
 */
export function getTranslatedExplanation(
  lang: SupportedLanguage,
  classification: string,
  san: string,
  bestSan?: string
): string {
  const isEn = lang === 'en';
  if (isEn) {
    if (classification === 'brilliant') return `Brilliant find! ${san} is a visionary tactical strike.`;
    if (classification === 'best') return `Excellent! ${san} maintains maximum control and harmony.`;
    if (classification === 'inaccuracy') return `Slight inaccuracy with ${san}.${bestSan ? ` Better was ${bestSan}.` : ''}`;
    if (classification === 'mistake') return `Mistake with ${san}!${bestSan ? ` Playing ${bestSan} was much safer.` : ''}`;
    if (classification === 'blunder') return `Blunder! ${san} creates tactical vulnerabilities.${bestSan ? ` Consider ${bestSan}.` : ''}`;
    return `Solid move with ${san}.`;
  }

  // Multi-language tailored coaching
  if (lang === 'te') {
    if (classification === 'brilliant') return `అద్భుతమైన ఎత్తు! ${san} ద్వారా మీరు పూర్తి పట్టు సాధించారు.`;
    if (classification === 'best') return `ఉత్తమ ఎత్తు! ${san} స్థానాన్ని చాలా బలంగా ఉంచుతుంది.`;
    if (classification === 'inaccuracy') return `${san} చిన్న అజాగ్రత్త.${bestSan ? ` దీనికంటే ${bestSan} బలమైన ఎత్తు.` : ''}`;
    if (classification === 'mistake') return `${san} తప్పు ఎత్తు!${bestSan ? ` ${bestSan} ఆడితే సురక్షితంగా ఉండేది.` : ''}`;
    if (classification === 'blunder') return `పెద్ద పొరపాటు! ${san} వల్ల మీ మోహరి ప్రమాదంలో పడింది.${bestSan ? ` ${bestSan} ఆడటం మేలు.` : ''}`;
    return `${san} సమతుల్యమైన ఎత్తు.`;
  }

  if (lang === 'hi') {
    if (classification === 'brilliant') return `अद्भुत चाल! ${san} एक दूरदर्शी सामरिक प्रहार है।`;
    if (classification === 'best') return `सर्वोत्तम चाल! ${san} स्थिति पर पूर्ण नियंत्रण रखता है।`;
    if (classification === 'inaccuracy') return `${san} एक छोटी अशुद्धि है।${bestSan ? ` बेहतर विकल्प ${bestSan} था।` : ''}`;
    if (classification === 'mistake') return `${san} एक गलती है!${bestSan ? ` ${bestSan} खेलना अधिक सुरक्षित था।` : ''}`;
    if (classification === 'blunder') return `बड़ी चूक! ${san} से आपके मोहरे असुरक्षित हो गए हैं।${bestSan ? ` ${bestSan} खेलना चाहिए था।` : ''}`;
    return `${san} एक संतुलित चाल है।`;
  }

  if (lang === 'ta') {
    if (classification === 'brilliant') return `அற்புதமான நகர்வு! ${san} எதிராளியை நிலைகுலையச் செய்கிறது.`;
    if (classification === 'best') return `சிறந்த நகர்வு! ${san} களத்தில் நல்ல கட்டுப்பாட்டைத் தருகிறது.`;
    if (classification === 'inaccuracy') return `${san} சிறு தவறு.${bestSan ? ` ${bestSan} நகர்த்தியிருக்கலாம்.` : ''}`;
    if (classification === 'mistake') return `${san} ஒரு தவறு!${bestSan ? ` ${bestSan} விளையாடியது பாதுகாப்பானது.` : ''}`;
    if (classification === 'blunder') return `பெரும் பிழை! ${san} நிலையை பலவீனப்படுத்துகிறது.${bestSan ? ` ${bestSan} விளையாடுங்கள்.` : ''}`;
    return `${san} ஒரு நல்ல நகர்வு.`;
  }

  if (lang === 'kn') {
    if (classification === 'brilliant') return `ಅದ್ಭುತ ನಡಿಗೆ! ${san} ಸ್ಥಾನವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ನಿಮ್ಮ ನಿಯಂತ್ರಣಕ್ಕೆ ತಂದಿದೆ.`;
    if (classification === 'best') return `ಉತ್ತಮ ನಡಿಗೆ! ${san} ಮಣೆಯ ಮೇಲೆ ಪರಿಪೂರ್ಣ ಸಮತೋಲನ ಕಾಯ್ದುಕೊಳ್ಳುತ್ತದೆ.`;
    if (classification === 'inaccuracy') return `${san} ಅಷ್ಟೊಂದು ನಿಖರವಲ್ಲ.${bestSan ? ` ${bestSan} ಆಡುವುದು ಉತ್ತಮವಾಗಿತ್ತು.` : ''}`;
    if (classification === 'mistake') return `${san} ಒಂದು ತಪ್ಪು!${bestSan ? ` ${bestSan} ಆಡಿದರೆ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತಿತ್ತು.` : ''}`;
    if (classification === 'blunder') return `ದೊಡ್ಡ ಪ್ರಮಾದ! ${san} ನಿಮ್ಮ ಕಾಯಿಗಳನ್ನು ಅಪಾಯಕ್ಕೆ ಒಡ್ಡಿದೆ.${bestSan ? ` ${bestSan} ಆಡಬೇಕಾಗಿತ್ತು.` : ''}`;
    return `${san} ಸಮತೋಲಿತ ನಡಿಗೆ.`;
  }

  if (lang === 'ml') {
    if (classification === 'brilliant') return `ഗംഭീര നീക്കം! ${san} കളിയിലെ മേൽക്കൈ ഉറപ്പാക്കുന്നു.`;
    if (classification === 'best') return `ഏറ്റവും മികച്ച നീക്കം! ${san} കരുത്തുറ്റ നിയന്ത്രണം നൽകുന്നു.`;
    if (classification === 'inaccuracy') return `${san} ചെറിയ പാകപ്പിഴയാണ്.${bestSan ? ` ${bestSan} ആയിരുന്നു കൂടുതൽ നല്ലത്.` : ''}`;
    if (classification === 'mistake') return `${san} ഒരു തെറ്റാണ്!${bestSan ? ` ${bestSan} കളിക്കുന്നത് സുരക്ഷിതമായിരുന്നു.` : ''}`;
    if (classification === 'blunder') return `വലിയ അബദ്ധം! ${san} കാരണം കരുക്കൾ അപകടത്തിലായി.${bestSan ? ` ${bestSan} ശ്രദ്ധിക്കുക.` : ''}`;
    return `${san} കൃത്യമായ നീക്കം.`;
  }

  if (lang === 'bn') {
    if (classification === 'brilliant') return `অসাধারণ দূরদর্শী চাল! ${san} আপনাকে খেলায় এগিয়ে রাখবে।`;
    if (classification === 'best') return `সেরা চাল! ${san} বোর্ডে সুন্দর ভারসাম্য বজায় রাখে।`;
    if (classification === 'inaccuracy') return `${san} চালটি নিখুঁত নয়।${bestSan ? ` এর চেয়ে ${bestSan} অনেক ভালো ছিল।` : ''}`;
    if (classification === 'mistake') return `${san} একটি ভুল চাল!${bestSan ? ` ${bestSan} খেলা অনেক নিরাপদ ছিল।` : ''}`;
    if (classification === 'blunder') return `মারাত্মক ভুল! ${san} আপনার ঘুঁটিকে বিপদে ফেলল।${bestSan ? ` ${bestSan} খেলা উচিত ছিল।` : ''}`;
    return `${san} একটি ভালো চাল।`;
  }

  if (lang === 'or') {
    if (classification === 'brilliant') return `ଚମତ୍କାର ଚାଲି! ${san} ଖେଳ ଉପରେ ଆପଣଙ୍କ ନିୟନ୍ତ୍ରଣ ବଢ଼ାଇଲା।`;
    if (classification === 'best') return `ସର୍ବୋତ୍ତମ ଚାଲି! ${san} ବୋର୍ଡରେ ସନ୍ତୁଳନ ବଜାୟ ରଖିଛି।`;
    if (classification === 'inaccuracy') return `${san} ଏକ ସାମାନ୍ୟ ଭୁଲ।${bestSan ? ` ଏହା ବଦଳରେ ${bestSan} ଉତ୍ତମ ଥିଲା।` : ''}`;
    if (classification === 'mistake') return `${san} ଏକ ଭୁଲ ଚାଲି!${bestSan ? ` ${bestSan} ଖେଳିବା ନିରାପଦ ଥିଲା।` : ''}`;
    if (classification === 'blunder') return `ବଡ଼ ଭୁଲ! ${san} ଆପଣଙ୍କ ମୋହରାକୁ ବିପଦରେ ପକାଇଲା।${bestSan ? ` ${bestSan} ଖେଳିବା ଉଚିତ ଥିଲା।` : ''}`;
    return `${san} ଏକ ଭଲ ଚାଲି।`;
  }

  return `Played ${san}.`;
}

/**
 * Returns translated pre-move hint for the player
 */
export function getTranslatedHint(lang: SupportedLanguage, san: string, from: string, to: string): string {
  if (lang === 'te') {
    return `${from} నుండి ${to} కి ${san} ఎత్తు వేయడం ఉత్తమం. ఇది మీ స్థానాన్ని బలపరుస్తుంది.`;
  }
  if (lang === 'hi') {
    return `${from} से ${to} पर ${san} चलना बेहतर रहेगा। यह आपके मोहरों को सक्रिय करता है।`;
  }
  if (lang === 'ta') {
    return `${from} இலிருந்து ${to} க்கு ${san} நகர்த்தலாம். இது களத்தை பலப்படுத்தும்.`;
  }
  if (lang === 'kn') {
    return `${from} ನಿಂದ ${to} ಗೆ ${san} ನಡೆಸುವುದು ಉತ್ತಮ. ಇದು ನಿಮ್ಮ ಸ್ಥಾನವನ್ನು ಬಲಪಡಿಸುತ್ತದೆ.`;
  }
  if (lang === 'ml') {
    return `${from} ൽ നിന്ന് ${to} ലേക്ക് ${san} കളിക്കുന്നത് നല്ലതാണ്. ఇది കളി മെച്ചപ്പെടുത്തും.`;
  }
  if (lang === 'bn') {
    return `${from} থেকে ${to} এ ${san} খেলা ভালো হবে। এটি আপনার অবস্থান শক্তিশালী করবে।`;
  }
  if (lang === 'or') {
    return `${from} ରୁ ${to} କୁ ${san} ଚଳାଇବା ଉତ୍ତମ ହେବ। ଏହା ସ୍ଥିତିକୁ ସୁଦୃଢ଼ କରିବ।`;
  }
  return `Consider playing ${san} from ${from} to ${to}. It optimizes piece coordination and central control.`;
}
