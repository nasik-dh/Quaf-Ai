/**
 * ENHANCED TELEGRAM BOT WEBHOOK HANDLER WITH QUIZ FUNCTIONALITY
 * Academic Grade - Production Ready Implementation
 * 
 * Features:
 * - /start command with immediate social media buttons
 * - Sequential social media messaging
 * - Robust phone number capture and validation
 * - Multi-subject quiz system with result tracking
 * - Quiz results stored in "Messages" Google Sheet with extended columns
 * - Comprehensive error handling and logging
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  BOT_TOKEN: "7352288690:AAEHWSSARHPNwL_nTOe3GOeExtpOLr7jFCk",
  MESSAGES_SHEET: "Messages", // Single sheet for messages + quiz results
  TELEGRAM_CHANNEL: "https://t.me/quafdhdc",
  USER_STATE: PropertiesService.getScriptProperties(),  // for tracking quiz states
  
  // Column mapping for Google Sheets "Messages" Sheet (0 indexed for arrays)
  MESSAGES_COLUMNS: {
    NAME: 0,          // Column A -> Name
    PHONE: 1,         // Column B -> Phone
    CHAT_ID: 2,       // Column C -> Chat ID
    MESSAGE_ID: 3,    // Column D -> Message ID
    MESSAGE: 4,       // Column E -> Message Text (or quiz subject/scores)
    TIMESTAMP: 5,     // Column F -> Timestamp
    SUBJECT: 6,       // Column G -> Quiz Subject (null or text; for quiz results)
    SCORE: 7,         // Column H -> Quiz Score (for quiz results)
    TOTAL: 8,         // Column I -> Quiz Total Questions (for quiz results)
    PERCENTAGE: 9     // Column J -> Quiz Percentage (for quiz results)
  },

  // API Configuration
  API_BASE_URL: "https://api.telegram.org/bot",
  MAX_RETRIES: 3,
  TIMEOUT_MS: 10000,
  
  // Social Media Links
  SOCIAL_MEDIA: {
    FACEBOOK: "https://www.facebook.com/people/Quafdhdc/61576548098341/",
    WHATSAPP: "https://wa.me/message/76OKA3KAKHINC1",
    INSTAGRAM: "https://www.instagram.com/quafdhdc/",
    YOUTUBE: "https://www.youtube.com/@quaf-dhdc",
    THREADS: "https://www.threads.com/@quafdhdc?invite=0",
    TELEGRAM: "https://t.me/quafdhdc",
    PHONE: "+919048538495"
  }
};

// ==================== QUIZ DATA ====================
// Skipped here as requested. Assume "subjectQuestions" object available with subjectId keys as arrays
// of {question:string, options:array of strings, correctAnswer: integer}
// ==================== QUIZ DATA ====================
const subjectQuestions = {
  "1": [
                {
                    question: "ഖുർആൻ അവതരിച്ചത് എത്ര കാലം കൊണ്ട്?",
                    options: ["20", "22", "23"],
                    correctAnswer: 2
                },
                {
                    question: "ഖുർആനിൽ ആകെ എത്ര സൂറത്തുകൾ ഉണ്ട്?",
                    options: ["111", "114", "117"],
                    correctAnswer: 1
                },
                {
                    question: "ഖുർആൻ അവതരണത്തിന്റെ മുമ്പ്  അത് രേഖപ്പെടുത്തിയിരുന്നത് എവിടെ?",
                    options: ["ആകാശത്ത്", "ലൗഹുൽ മഹ്ഫൂളിൽ", "ഭൂമിയിൽ"],
                    correctAnswer: 1
                },
                {
                    question: "ഖുർആനിൽ ആദ്യമായി അവതരിച്ച ആയത്ത് ഏത് സൂറത്തിലാണ്?",
                    options: ["അലഖ്", "മുദസിർ", "ബഖറ"],
                    correctAnswer: 0
                },
                {
                    question: "ഒരു സൂറത്തായി ഒന്നിച്ച് പൂര്‍ണ്ണമായി  അവതരിച്ച സൂറത്ത് ?",
                    options: ["മുസ്സമിൽ", "കൗസർ", "മുദസിർ"],
                    correctAnswer: 2
                },
                {
                    question: "ഖുർആനിലെ ഏറ്റവും മഹത്വമുള്ള സൂറത്ത്?",
                    options: ["മുൽക്", "ഫാത്തിഹ", "യാസീൻ"],
                    correctAnswer: 1
                },
                {
                    question: "ഖുർആനിലെ ഏറ്റവും ചെറിയ സൂറത്ത്?",
                    options: ["അസ്ർ", "കൗസർ", "ഇഖ്ലാസ്"],
                    correctAnswer: 1
                },
                {
                    question: "എല്ലാ ആയത്തിലും അല്ലാഹു എന്ന പദമുള്ള സൂറത്ത്?",
                    options: ["ഹഷ്‌ർ", "ഫാത്തിഹ", "മുജാദല"],
                    correctAnswer: 2
                },
                {
                    question: "ഖുര്‍ആനില്‍ പേരെടുത്ത് പറഞ്ഞ ഒരേ ഒരു സ്വഹാബി?",
                    options: ["സൈദ് (റ)", "അബ്ബാസ് (റ)", "അബൂബക്കർ (റ)"],
                    correctAnswer: 0
                },
                {
                    question: "ഖുർആൻ അവതരിച്ച രാത്രിയുടെ പേര്?",
                    options: ["ലൈലത്തുൽ ബറാഅ", "ലൈലത്തുൽ ഷഅബാൻ", "ലൈലത്തുൽ ഖദ്ർ"],
                    correctAnswer: 2
                },
                {
                    question: "ഖുർആനിൽ എത്ര നബിമാരുടെ പേര് പരാമര്‍ശിച്ചിട്ടുണ്ട്?",
                    options: ["33", "15", "25"],
                    correctAnswer: 2
                },
                {
                    question: "ഖുർആനിൽ ഏറ്റവുമധികം തവണ പേര് പറയപ്പെട്ട നബി?",
                    options: ["ഇബ്രാഹീം (അ)", "മൂസ(അ)", "സുലൈമാൻ(അ)"],
                    correctAnswer: 1
                },
                {
                    question: "നരകത്തിന് എത്ര വാതിലുകളുണ്ടെന്നാണ് ഖുര്‍ആനിലെ പരാമര്‍ശം?",
                    options: ["7", "11", "3"],
                    correctAnswer: 0
                },
                {
                    question: "ഖുർആനിന്റെ മണവാട്ടി എന്നറിയപ്പെടുന്ന സൂറത്ത്?",
                    options: ["റഹ്‌മാൻ", "വാഖിഅ", "മുൽക്"],
                    correctAnswer: 0
                },
                {
                    question: "ഖുർആനിന്റെ ഹൃദയം എന്നറിയപ്പെടുന്ന സൂറത്ത്?",
                    options: ["ഇഖ്ലാസ്", "യാസീൻ", "കഹ്‌ഫ്"],
                    correctAnswer: 1
                },
                {
                    question: "ഖുർആൻ പേരെടുത്തു പറഞ്ഞ ഏക സ്ത്രീ?",
                    options: ["മർയം", "ആസിയ", "മാഷിത"],
                    correctAnswer: 0
                },
                {
                    question: "ഖുർആൻ പരാമർശിച്ച റൂഹുൽ ആമീൻ എന്ന മലക്ക് ?",
                    options: ["ജിബ്‌രീൽ", "ഇസ്രാഫീൽ", "അസ്റാഈൽ"],
                    correctAnswer: 0
                },
                {
                    question: "രണ്ട് ബിസ്മിയുള്ള സൂറത്ത്?",
                    options: ["റഹ്‌മാൻ", "ഫാത്തിർ", "നംൽ"],
                    correctAnswer: 2
                },
                {
                    question: "അബാബീൽ പക്ഷികളെ പരാമർശിച്ച സൂറത്ത്?",
                    options: ["ഫീൽ", "ഖുറൈശ്", "മാഊൻ"],
                    correctAnswer: 0
                },
                {
                    question: "ഇബ്രാഹിം (അ) ന്റെ കാലത്ത് ജീവിച്ച മറ്റൊരു നബി?",
                    options: ["ഹാറൂൻ", "ലൂഥ്", "ആർമിയാഅ്"],
                    correctAnswer: 1
                }
            ],
            "2": [
                {
                    question: "ഖുർആൻ കഴിഞ്ഞാൽ ഏറ്റവും ശ്രേഷ്ഠതയുള്ള കിതാബ്?",
                    options: ["സ്വഹീഹ് ബുഖാരി", "സ്വഹീഹ് മുസ്‌ലിം", "തിർമുദി"],
                    correctAnswer: 0
                },
                {
                    question: "അല്ലാഹു മനുഷ്യന്റെ ഏത് ഭാഗത്തേക്കാണ് നോക്കുന്നത്?",
                    options: ["جسد", "جمال", "قلب"],
                    correctAnswer: 2
                },
                {
                    question: "കൊല്ലുന്നവനും കൊല്ലപ്പെടുന്നവനും നരകത്തിലാണ് (കൊല്ലപ്പെടുന്നവൻ എന്ത് കൊണ്ട് നരകത്തിൽ പ്രവേശിക്കുന്നു)",
                    options: ["അവൻ അക്രമിയാണ്", "അവൻ ദൈവ നിഷേധിയാണ്", "അവൻ തന്റെ കൂട്ടുകാരന്റെ വധത്തിൽ ആഗ്രഹമുള്ളവനാണ്"],
                    correctAnswer: 2
                },
                {
                    question: "അല്ലാഹു തൗബ സ്വീകരിക്കാത്ത സമയം?",
                    options: ["അല്ലാഹുവിങ്കൽ കള്ളൻ എന്ന് എഴുതപ്പെട്ടാൽ", "സൂര്യൻ പടിഞ്ഞാറ് നിന്ന് ഉദിച്ചാൽ", "ഈസാനബി (അ) ഇറങ്ങി വന്നാൽ"],
                    correctAnswer: 1
                },
                {
                    question: "(സിദ്ഖ്) മനുഷ്യനെ എവിടേക്ക് നയിക്കും?",
                    options: ["സന്മാർഗം", "സ്വർഗം", "ഗുണം"],
                    correctAnswer: 2
                },
                {
                    question: "ബനൂ ഇസ്റാഈല്യരിലെ ആദ്യ ഫിത്ന ആരിലായിരുന്നു?",
                    options: ["സമ്പന്നൻ", "പെണ്ണ്", "ആണ്"],
                    correctAnswer: 1
                },
                {
                    question: "പക്ഷികൾക്ക് ഭക്ഷണം നൽകുന്നത് പോലെ അല്ലാഹു ഭക്ഷണം നൽകും ആർക്ക്?",
                    options: ["അല്ലാഹുവിനെ ഭരമേല്പിച്ചവർക്ക്", "കുറഞ്ഞത് കൊണ്ട് തൃപ്തിപ്പെടുന്നവർക്ക്", "പ്രഭാതത്തിലും പ്രദോഷത്തിലും മസ്ജിദിൽ പോകുന്നവർക്ക്"],
                    correctAnswer: 0
                },
                {
                    question: "ഉമ്മുസലമ (റ) യുടെ യഥാർത്ഥ പേര്?",
                    options: ["ഹിന്ദ് ബിൻത് അബി ഉത്ബ", "ഹിന്ദ് ബിൻത് അബി ഉമയ്യ", "ഹിന്ദ് ബിൻത് അബി സലമ"],
                    correctAnswer: 1
                },
                {
                    question: "ആര് ആരോട് പറഞ്ഞതാണ് افلا احب ان اكون عبدا شكورا ?",
                    options: ["നബി (സ) ഉമ്മുസലമ (റ)യോട്", "നബി (സ) ആയിഷാ (റ) യോട്", "നബി (സ) അബൂഹുറയ്റ(റ)നോട്"],
                    correctAnswer: 1
                },
                {
                    question: "ഈമാനിന്ന് എത്ര ശാഖകളുണ്ട്?",
                    options: ["70", "60", "50"],
                    correctAnswer: 0
                },
                {
                    question: "അല്ലാഹു അർശിന്റെ തണലിട്ട് കൊടുക്കുന്ന വിഭാഗങ്ങൾ എത്ര?",
                    options: ["10", "7", "5"],
                    correctAnswer: 1
                },
                {
                    question: "ഒരു കാര്യം ചെയ്താൽ നിങ്ങൾ പരസ്പരം സ്നേഹമുള്ളവരാകും. ആ കാര്യം ഏത്?",
                    options: ["സ്വദഖ അധികരിപ്പിക്കുക", "രഹസ്യങ്ങളെ പരസ്യപ്പെടുത്താതിരുന്നാൽ", "സലാം പറയലിനെ വ്യാപിപ്പിക്കുക"],
                    correctAnswer: 2
                },
                {
                    question: "الموجبتان ?",
                    options: ["സ്വർഗവും നരകവും നിർബന്ധമാക്കുന്ന കാര്യം", "നോമ്പും നിസ്കാരവും", "സ്വദഖയും സകാത്തും"],
                    correctAnswer: 0
                },
                {
                    question: "ഈ ഹദീസ് നബി (സ) പറഞ്ഞ സന്ദർഭം ഏത് لايموتن أحدكم إلا وهويحسن الظن بالله عز وجل ?",
                    options: ["വഫാതാകുന്നതിന് മൂന്ന് ദിവസം മുമ്പ്", "വഫാത്തിന്റെ സമയത്ത്", "പനി വന്ന സമയത്ത്"],
                    correctAnswer: 0
                },
                {
                    question: "നബി (സ) പറഞ്ഞു. നിങ്ങളിൽ ഏറ്റവും ഉത്തമർ?",
                    options: ["ഹൃദയം പള്ളികളുമായി ബന്ധപ്പെട്ട വ്യക്തികൾ", "വെള്ള വസ്ത്രം ധരിക്കുന്നവർ", "ഭാര്യമാരോട് നല്ല നിലയിൽ വർത്തിക്കുന്നവർ"],
                    correctAnswer: 2
                },
                {
                    question: "നബി (സ) പറഞ്ഞു. രണ്ടനുഗ്രഹങ്ങൾ ഉപയോഗപ്പെടുത്തുന്നതിൽ അധിക പേരും പരാജിതരാണ്.രണ്ടനുഗ്രഹങ്ങൾ ഏതെല്ലാം?",
                    options: ["المال والبنون", "الصحة والفراغ", "الصلاة والصوم"],
                    correctAnswer: 1
                },
                {
                    question: "വസ്ത്രങ്ങളിൽ ഏറ്റവും ഉത്തമമായ വസ്ത്രം?",
                    options: ["പച്ച നിറത്തിലുള്ള വസ്ത്രം", "വെള്ള നിറത്തിലുള്ളവസ്ത്രം", "പെരുന്നാൾ വസ്ത്രം"],
                    correctAnswer: 1
                },
                {
                    question: "മക്കം ഫത്ഹിന്റെ ദിവസം ആരുടെ തലയിലും താടിയിലുമാണ് നിറം പൂശാൻ കല്പിച്ചത്?",
                    options: ["ابو قحافة", "أبي أمية", "ابو عمر"],
                    correctAnswer: 0
                },
                {
                    question: "മനുഷ്യരെ കൂടുതലായി നരകത്തിലാക്കുന്ന അവയവം?",
                    options: ["عين", "يد", "فرج"],
                    correctAnswer: 2
                },
                {
                    question: "യഥാർത്ഥ ഐശ്വര്യം ഏത്?",
                    options: ["ശാരീരിക ഐശ്വര്യം", "സാമ്പത്തിക ഐശ്വര്യം", "മാനസിക ഐശ്വര്യം"],
                    correctAnswer: 2
                }
            ],
            "3": [
                {
                    question: "ജുമുഅയുടെ രാവും പകലും _______ ഓതണം?",
                    options: ["യാസീൻ", "കഹ്‌ഫ്", "റഹ്‌മാൻ"],
                    correctAnswer: 1
                },
                {
                    question: "രാത്രി അല്പം ഇറങ്ങിയതിനു ശേഷം എഴുനേറ്റു നമസ്കരിക്കുമ്പോൾ ഖിയാമുലൈലിന്_____________ എന്ന് പറയുന്നു?",
                    options: ["തഹജ്ജുദ്", "ളുഹാ", "തറാവീഹ്"],
                    correctAnswer: 0
                },
                {
                    question: "വിത്ർ എന്ന പതത്തിന്റെ അർഥം ________ ?",
                    options: ["ഇരട്ട", "ഒറ്റ", "പതിവ്"],
                    correctAnswer: 1
                },
                {
                    question: "ഫർള് നമസ്കാരങ്ങളുടെ മുമ്പും ശേഷവും ചെയ്യുന്ന സുന്നത്തുനമസ്കാരങ്ങൾ __________ എന്ന് പറയുന്നു?",
                    options: ["വിത്ർ", "തഹിയ്യത്", "റവാതിബ്"],
                    correctAnswer: 2
                },
                {
                    question: "وارحمه = അർഥം എന്താണ് ?",
                    options: ["ഇദേഹത്തോട് നീ കരുണ കാണിക്കേണമേ", "ങ്ങങ്ങൾക്കൊരു മുന്ഗാമിയെ തെരേണമേ", "ഇദേഹത്തതിന് പ്രവേശന സ്ഥലം നീ വിശാലമാക്കി തരേണമെ"],
                    correctAnswer: 0
                },
                {
                    question: "ജുമുഅ നമസ്കാരം ആർക്കൊക്കെയാണ് നിർബന്ധം?",
                    options: ["പുരുഷന്മാർ", "സ്വതന്ത്ര പുരുഷന്മാർ", "കുട്ടികൾ"],
                    correctAnswer: 1
                },
                {
                    question: "മയ്യിത്ത നമസ്കാരങ്ങൾക് എത്ര ഫർളുകളുണ്ട്?",
                    options: ["8", "6", "4"],
                    correctAnswer: 0
                },
                {
                    question: "നമസ്കാരത്തിൽ ഇളവുള്ളത് ആർക്കൊക്കെ?",
                    options: ["യാത്രക്കാർ", "രോഗികൾ", "യാത്രക്കാർ,രോഗികൾ"],
                    correctAnswer: 0
                },
                {
                    question: "ഹിജ്റ വര്ഷം എത്രാമത്തെ മാസമാണ് റമദാൻ?",
                    options: ["8", "9", "10"],
                    correctAnswer: 1
                },
                {
                    question: "നമസ്കാരം ബാതിലാവുന്ന കാര്യം ചൂസ് ചെയുക?",
                    options: ["നമസ്കാരത്തിന് ശർത്തുകളിലേതെങ്കിലുമൊന്ന് വേണെമെങ്കിൽ പാലിച്ചാൽ", "ഖുർആൻ,ദിക്ർ,ദുആ എന്നിവയെല്ലാത്ത മറ്റു വാക്കുകൾ ഉച്ചരിച്ചാൽ", "നമസ്കാരത്തിനിടയിൽ ആ നമസ്കാരം നിർത്തുകയാണ് എന്ന് കരുതിയില്ലെങ്കിൽ നമസ്കാരം ബാതിലാവും."],
                    correctAnswer: 1
                },
                {
                    question: "വുളൂഇൽ മുഖം കഴുകലിന്റെ വിധി?",
                    options: ["സുന്നത്", "ഫർള്", "ജാഇസ്"],
                    correctAnswer: 1
                },
                {
                    question: "മുന്നിൽ __________ അവർക്കു പിന്നിൽ ________ ഏറ്റവും പിന്നിൽ _________?",
                    options: ["പുരുഷന്മാർ,കുട്ടികൾ,സ്ത്രീകൾ", "പുരുഷന്മാർ,സ്ത്രീകൾ,കുട്ടികൾ", "പുരുഷന്മാർ,പെൺകുട്ടികൾ,സ്ത്രീകൾ"],
                    correctAnswer: 0
                },
                {
                    question: "ജമാഅത് നമസ്കാരങ്ങൾ ശെരിയാവുന്നതിനുള്ള നിബന്ധനകൾ എത്ര?",
                    options: ["5", "7", "12"],
                    correctAnswer: 1
                },
                {
                    question: "നമസ്കാരം ബാതിലാവുന്ന കാര്യങ്ങൾ എത്ര?",
                    options: ["8", "7", "6"],
                    correctAnswer: 2
                },
                {
                    question: "ഇവിടെ കൊടുത്തതിൽ ഏതാണ് സുന്നത്ത്?",
                    options: ["ളുഹർ നമസ്കരിക്കൽ", "നോമ്പ് തുറക്കൽ", "ഖിയാമുലൈൽ ഒറ്റ റകഅത്ത ആയി നിർത്തുക"],
                    correctAnswer: 2
                },
                {
                    question: "ഒരാൾ വജ്ജഹ്തു ഓതാൻ മറന്നു ബിസ്മി ഓതിയാൽ വീണ്ടും വജ്ജഹ്തു ഓതുന്നതിന്റെ വിധി?",
                    options: ["ജാഇസ്", "കറാഹത്", "ഹറാം"],
                    correctAnswer: 2
                },
                {
                    question: "صلاه الاستسقاء ?",
                    options: ["ഗ്രഹണനമസ്കാരം", "നന്മയെ തേടുന്ന നമസ്കാരം", "മഴക്കുവേണ്ടിയുള്ള നമസ്കാരം"],
                    correctAnswer: 2
                },
                {
                    question: "ജുമുഅക്ക് മുമ്പ് റവാതിബ് ഉണ്ടോ?",
                    options: ["ഇല്ല", "ഉണ്ട്", "നിർബന്ധം ഇല്ല"],
                    correctAnswer: 0
                },
                {
                    question: "ഖുതുബയുടെ നിർബന്ധ ഘടകങ്ങൾ എത്ര?",
                    options: ["9", "7", "5"],
                    correctAnswer: 2
                },
                {
                    question: "നമസ്കരിക്കാൻ പാടില്ലാത്ത സമയങ്ങൾ എത്ര?",
                    options: ["5", "4", "3"],
                    correctAnswer: 1
                }
            ],
            "4": [
                {
                    question: "ഇബ്രാഹിം (അ) ന്റെ സ്വദേശം?",
                    options: ["ഇറാഖ്", "ഇറാൻ", "ഫലസ്തീൻ"],
                    correctAnswer: 0
                },
                {
                    question: "ഉറുമ്പിനോട് സംസാരിച്ച പ്രവാചകൻ?",
                    options: ["ദാവൂദ്", "സുലൈമാൻ", "ഹാറൂൻ"],
                    correctAnswer: 1
                },
                {
                    question: "ഉമ്മുൽ ഖുറാ പട്ടണം ഏത്?",
                    options: ["മക്ക", "മദീന", "ജെറുസലേം"],
                    correctAnswer: 0
                },
                {
                    question: "യഹൂദികൾ ദൈവ പുത്രനായി കണ്ടിരുന്നത് ആരെ?",
                    options: ["ദാനിയാൽ", "ഷംവീൽ", "ഉസൈർ"],
                    correctAnswer: 2
                },
                {
                    question: "അബു ജഹൽ ന്റെ യഥാർത്ഥ പേര്?",
                    options: ["അംറ് ബിൻ അസിം", "അംറ് ബിൻ ഖുതമാ", "അംറ് ബിൻ ഹിഷാം"],
                    correctAnswer: 2
                },
                {
                    question: "നൂഹ് നബിയുടെ പ്രബോധന കാലം?",
                    options: ["670", "950", "786"],
                    correctAnswer: 1
                },
                {
                    question: "നീനവ സമുദായത്തിലേക്ക് അയക്കപ്പെട്ട പ്രവാചകൻ?",
                    options: ["യഹ്‌യ", "യൂനുസ്", "ദുൽകിഫ് ലി"],
                    correctAnswer: 1
                },
                {
                    question: "സമൂദ് സമുദായത്തിലേക്ക് നിയോഗിക്കപ്പെട്ട പ്രവാചകൻ?",
                    options: ["സ്വാലിഹ്", "ഹൂദ്", "ലൂഥ്"],
                    correctAnswer: 0
                },
                {
                    question: "മദ് യനിലെ പ്രവാചകൻ?",
                    options: ["ആർമിയാഅ", "ഷുഹൈബ്", "യൂശഅ"],
                    correctAnswer: 1
                },
                {
                    question: "ഫിർഔനെ മുക്കിയ കടൽ?",
                    options: ["കാസ്പിയൻ", "കരിങ്കടൽ", "ചെങ്കടൽ"],
                    correctAnswer: 2
                },
                {
                    question: "മജൂസികൾ ആര്?",
                    options: ["തീ ആരാധകർ", "കല്ല് ആരാധകർ", "സൂര്യ ആരാധകർ"],
                    correctAnswer: 0
                },
                {
                    question: "ഇസ്ലാമിൽ ഒന്നാമതായി നിർമ്മിക്കപ്പെട്ട പള്ളി?",
                    options: ["മസ്ജിദുൽ അഖ്സ", "മസ്ജിദുൽ ഹറാം", "മസ്ജിദുൽ ഖുബ"],
                    correctAnswer: 2
                },
                {
                    question: "തബൂഖ് യുദ്ധത്തെ കുറിച്ച് പറയുന്ന സൂറത്ത്?",
                    options: ["ഫാത്തിർ", "തൗബ", "ഫുസിലത്"],
                    correctAnswer: 1
                },
                {
                    question: "പടയങ്കിയിൽ പരിഷ്കാരം വരുത്തിയ പ്രവാചകൻ?",
                    options: ["സുലൈമാൻ", "ദാവൂദ്", "ദുൽഖർനൈൻ"],
                    correctAnswer: 1
                },
                {
                    question: "ഇബ്രാഹിം നബി ഇറാഖിൽ നിന്ന് എവിടേക്കാണ് ഹിജ്‌റ പോയത്?",
                    options: ["യസ്രിബ്", "കൂഫ", "ശാം"],
                    correctAnswer: 0
                },
                {
                    question: "അഹ്‌സാബ് യുദ്ധത്തിന്റെ മറ്റൊരു പേര്?",
                    options: ["ബദ്ർ", "ഉഹ്ദ്", "ഖന്തഖ്"],
                    correctAnswer: 2
                },
                {
                    question: "അബുൽ ബശർ എന്ന് അപരനാമം ഉള്ള പ്രവാചകൻ?",
                    options: ["നൂഹ്", "ആദം", "ഇദ് രീസ്"],
                    correctAnswer: 1
                },
                {
                    question: "യഅഖൂബ് നബിയുടെ സന്താനങ്ങൾ?",
                    options: ["14", "12", "16"],
                    correctAnswer: 1
                },
                {
                    question: "മൂസ നബിയുടെ പിതാവിന്റെ പേര്?",
                    options: ["ആസർ", "ഇമ്രാൻ", "മൽക്കാൻ"],
                    correctAnswer: 1
                },
                {
                    question: "അബ്രഹത് ഏത് രാജ്യത്തിന്റെ ഗവർണർ ആയിരുന്നു?",
                    options: ["സിറിയ", "ഇറാഖ്", "യമൻ"],
                    correctAnswer: 2
                }
            ],
            
            // 5. Nahv
            "5": [
                {
                    question: "اختر الصحيح من فعل المضارع",
                    options: ["قال", "بكى", "يرى"],
                    correctAnswer: 2
                },
                {
                    question: "اختر الصحيح من الاسم",
                    options: ["يرموق", "مرض", "بات"],
                    correctAnswer: 0
                },
                {
                    question: "اختر المبتدأ من الجملة 'البستان جميل' ",
                    options: ["البستان", "جميل", "البستان جميل"],
                    correctAnswer: 0
                },
                {
                    question: "اختر الفاعل من الجملة ' ضرب الأستاد زيدا' ",
                    options: ["ضرب", "الأستاد", "زيد"],
                    correctAnswer: 1
                },
                {
                    question: "اختر المفعول من الجملة 'شتم الرجل الطفل' ",
                    options: ["الطفل", "شتم", "الرجل"],
                    correctAnswer: 0
                },
                {
                    question: "اختر اداة الصحيحة من اخت كان",
                    options: ["ليت", "لعل", "أصبح"],
                    correctAnswer: 2
                },
                {
                    question: "اختر اداة الصحيحة من اخت إنّ",
                    options: ["بات", "صار", "لكن"],
                    correctAnswer: 2
                },
                {
                    question: "'ذهب السارق' هل هذه الجملة مفيدة أو غير مفيدة",
                    options: ["نعم", "لا", "غير"],
                    correctAnswer: 1
                },
                {
                    question: "اختر عبارة الصحيحة",
                    options: ["النعت لا يتبع المنعوت", "يرفع اسم إنّ", "ينصب خبر كان"],
                    correctAnswer: 2
                },
                {
                    question: "هل هذه الجملة صحيحة ام لا ' كان زيداً عالمٌ ' ",
                    options: ["نعم", "لا", "غير"],
                    correctAnswer: 1
                },
                {
                    question: "هل هذه الجملة صحيحة ام لا 'زيدٌ عاقلٌ ' ",
                    options: ["نعم", "لا", "غير"],
                    correctAnswer: 0
                },
                {
                    question: "في اي جملة يشتمل فيها حرف الجر",
                    options: ["رجل عاقل", "متى الساعة", "نظرت الى القمر"],
                    correctAnswer: 2
                },
                {
                    question: "هل هذه الجملة صحيحة ام لا 'زيدٌ في البيتَ ' ",
                    options: ["نعم", "لا", "غير"],
                    correctAnswer: 1
                },
                {
                    question: "وفق بحرف الجر الصحيح ' ذهب التاجر السوق' ",
                    options: ["في", "ب", "إلى"],
                    correctAnswer: 2
                },
                {
                    question: "وفق بحرف الجر الصحيح ' ركبتُ السيارة ' ",
                    options: ["في", "من", "على"],
                    correctAnswer: 2
                },
                {
                    question: "وفق بأداة إنّ الصحيح ' السكر مرّ' ",
                    options: ["ليت", "كأنّ", "لعل"],
                    correctAnswer: 0
                },
                {
                    question: "وفق بأداة إنّ الصحيحة 'طلعت الشمس ..... المطر شديد' ",
                    options: ["لعل", "لكن", "كأن"],
                    correctAnswer: 1
                },
                {
                    question: "لم ولا ناهية وإن",
                    options: ["حروف الرفع", "حروف النصب", "حروف الجزم"],
                    correctAnswer: 2
                },
                {
                    question: "أن، لن، إذن، كي",
                    options: ["حروف النصب", "حروف الرفع", "حروف الجزم"],
                    correctAnswer: 0
                },
                {
                    question: "هل هذه الجملة الصحيحة ام لا 'لن يدرسَ ا' ",
                    options: ["لا", "نعم", "غير"],
                    correctAnswer: 1
                }
            ],
            
            // 6. Swarf
            "6": [
                {
                    question: "الأفعال كم اقسام",
                    options: ["5", "3", "4"],
                    correctAnswer: 2
                },
                {
                    question: "الماضي كم اقسام",
                    options: ["4", "12", "2"],
                    correctAnswer: 2
                },
                {
                    question: "المعروف كم اوجه",
                    options: ["20", "14", "12"],
                    correctAnswer: 1
                },
                {
                    question: "صيغة وحدان حكاية نفس متكلم از اثبات فعل ماضي معروف ضمير درو أنا",
                    options: ["أفعل", "ما فعلتُ", "فعلتُ"],
                    correctAnswer: 2
                },
                {
                    question: "صيغة تثنية مذكر عائب از اثبات فعل ماضي مجهول ضمير درو هما",
                    options: ["فُعلتا", "فُعلا", "ما فُعلا"],
                    correctAnswer: 1
                },
                {
                    question: "صيفة وحدان مؤنث عائب از اثبات فعل مستقبل معروف ضمير درو هي",
                    options: ["تفعل", "تفعلين", "لا تفعلان"],
                    correctAnswer: 0
                },
                {
                    question: "اختر الضمير الصحيح  ' ما فعلتُ' ",
                    options: ["نحن", "انت", "انا"],
                    correctAnswer: 2
                },
                {
                    question: "اختر الضمير الصحيح ' ما فُعلتْ ' ",
                    options: ["انتِ", "انا", "هي"],
                    correctAnswer: 2
                },
                {
                    question: "اختر الضمير الصحيح ' تفعلين ' ",
                    options: ["هي", "انتِ", "انتم"],
                    correctAnswer: 1
                },
                {
                    question: "اختر الضمير الصحيح ' لا تفعلنَ ' ",
                    options: ["أنتن", "هن", "هم"],
                    correctAnswer: 0
                },
                {
                    question: "اختر الضمير الصحيح ' لم أفعلْ' ",
                    options: ["أنا", "هو", "أنتَ"],
                    correctAnswer: 0
                },
                {
                    question: "صيغة وحدان حكاية نفس متكلم از نفي فعل مستقبل مجهول ضمير درو أنا",
                    options: ["لم أَفعلْ", "لا أُفعلُ", "ما فُعلتُ"],
                    correctAnswer: 1
                },
                {
                    question: "واذا أردت أن تنفي الفعل المستقبل فزد في اوّله ......",
                    options: ["ما", "لم", "لا"],
                    correctAnswer: 2
                },
                {
                    question: "وإذا أردت ان تجعل المستقبل مجهولا فافتح علامة الاستقبال واضمم عين الفعل",
                    options: ["لا صحيح", "صحيح", "غير"],
                    correctAnswer: 0
                },
                {
                    question: "صيغة جمع مؤنث حاضر از نفي فعل مستقبل معروف ضمير درو أنتن",
                    options: ["تفعلن", "فعلن", "لم تفعلن"],
                    correctAnswer: 2
                },
                {
                    question: "اذا أردت ان تجعل الفعل المستقبل على التأكيد مع النفي فادخل عليه .....",
                    options: ["أن", "لن", "إن"],
                    correctAnswer: 1
                },
                {
                    question: "صيغة وحدان مذكر از أمر حاضر ضمير درو أنتَ",
                    options: ["إفعل", "إفعلي", "إفعلوا"],
                    correctAnswer: 0
                },
                {
                    question: "نون التأكيد كم هي",
                    options: ["3", "2", "1"],
                    correctAnswer: 1
                },
                {
                    question: "صيغة جمع مؤنث از نهي حاضر ضمير درو أنتن",
                    options: ["لا تفعلنْ", "ليفعلنّ", "لم تُفعَلنْ"],
                    correctAnswer: 0
                },
                {
                    question: "صيغة وحدان مذكر از اسم المفعول ضمير درو هو",
                    options: ["فاعل", "مفعول", "مفعولة"],
                    correctAnswer: 1
                }
            ],
            
            // 7. Tasawwuf
            "7": [
                {
                    question: "മസ്നവിയുടെ രചയിതാവ്",
                    options: ["ഇമാം ഗസാലി", "റൂമി", "ഖുശൈരി"],
                    correctAnswer: 1
                },
                {
                    question: "ഇഹ്‌യാ ഉലൂമുദ്ധീ ന്റെ രചയിതാവ്",
                    options: ["റൂമി", "ജുനൈദുൽ ബാഗ്ദാദി", "ഇമാം ഗസാലി"],
                    correctAnswer: 2
                },
                {
                    question: "അൽ ഹികമുൽ അതാഇയ്യ യുടെ രചയിതാവ്",
                    options: ["ഖാജാ ജിഷ്തി അജ്മീരി", "അബ്ദുറഹ്മാൻ അൽ ജാമി", "ഇബ്ൻ അതാഇല്ലാഹി സിക്കന്ദരി"],
                    correctAnswer: 2
                },
                {
                    question: "ബഹ്ജത്തുൽ അസ്റാർ രചിച്ചതാര്",
                    options: ["അബ്ദുറഹ്മാൻ അൽ ജാമി", "മുഹമ്മദ്‌ ഇക്ബാൽ", "ഇബ്ൻ അറബി"],
                    correctAnswer: 0
                },
                {
                    question: "ഫുതൂഹാത്തുൽ മക്കിയ്യ രചിച്ചതാര്",
                    options: ["ഇബ്ൻ അറബി", "മുഹമ്മദ്‌ ഇക്ബാൽ", "ഫരീദദീൻ അത്താർ"],
                    correctAnswer: 0
                },
                {
                    question: "തസ്‌കിറത്തുൽ അവ് ലിയ രചിച്ചതാര്",
                    options: ["ഇമാം ഖുശയ്രി", "ഫരീദദീൻ അത്താർ", "ഇബ്ൻ അറബി"],
                    correctAnswer: 1
                },
                {
                    question: "ഫീഹി മാ ഫീഹി രചിച്ചതാര്",
                    options: ["മുഹമ്മദ്‌ ഇക്ബാൽ", "റൂമി", "ഖുഷയ്രി"],
                    correctAnswer: 1
                },
                {
                    question: "ഖാബ ഖവ്സൈനി രചിച്ചതാര്",
                    options: ["ഇബ്ൻ അറബി", "ജുനൈദുൽ ഭാഗ്ദാദി", "മുഹമ്മദ്‌ ഇക്ബാൽ"],
                    correctAnswer: 2
                },
                {
                    question: "റാബിയ അൽഅദവിയ്യ (ഖ) ജനന വർഷം",
                    options: ["AD 720", "AD 717", "AD 731"],
                    correctAnswer: 1
                },
                {
                    question: "ജുനൈദുൽ ഭാഗ്ദാദി (ഖ) ജനനം",
                    options: ["AD 780", "AD 810", "AD 830"],
                    correctAnswer: 2
                },
                {
                    question: "ഇബ്രാഹിം ബിൻ അധ്ഹം (ഖ) ജനനം",
                    options: ["AD 820", "AD 718", "AD 696"],
                    correctAnswer: 1
                },
                {
                    question: "അബ്ദുൽ ഖാദിർ ജീലാനി (ഖ) ജനനം",
                    options: ["AD 1077", "AD 1091", "AD 1202"],
                    correctAnswer: 0
                },
                {
                    question: "ബാ യാസീദുൽ ബസ്താമി (ഖ) ജനനം",
                    options: ["AD 804", "AD 812", "AD 792"],
                    correctAnswer: 0
                },
                {
                    question: "ജിഷ്തി അജ്മീരി (ഖ) ജനനം",
                    options: ["AD 1124", "AD 1154", "AD 1141"],
                    correctAnswer: 2
                },
                {
                    question: "ജലാലുദ്ധീൻ റൂമി (ഖ) ജനനം",
                    options: ["AD 896", "AD 1207", "AD 1303"],
                    correctAnswer: 1
                },
                {
                    question: "നിസാമുദ്ധീൻ ഔലിയ (ഖ) ജനനം",
                    options: ["AD 1238", "AD 1228", "AD 1218"],
                    correctAnswer: 0
                },
                {
                    question: "അമീർ ഖുസ് റു (ഖ) ജനനം",
                    options: ["AD1229", "AD 1354", "AD 1253"],
                    correctAnswer: 2
                },
                {
                    question: "ശംസുദ്ധീൻ തബ്രീസി (ഖ) യുടെ പ്രദേശം",
                    options: ["ഇറാഖ്", "ഇറാൻ", "ഈജിപ്‌ത്"],
                    correctAnswer: 1
                },
                {
                    question: "അബു ഥാലിബ്‌ അൽ മക്കി (ഖ) യുടെ പ്രദേശം",
                    options: ["ജോർദാൻ", "ഈജിപ്‌ത്", "ഇറാഖ്"],
                    correctAnswer: 2
                },
                {
                    question: "അഹ്മദ് തീജാനി (ഖ) യുടെ പ്രദേശം",
                    options: ["സെർബിയ", "അൽജീരിയ", "മൊറോക്കോ"],
                    correctAnswer: 1
                }
            ],
            
            // 8. Arabic
            "8": [
                {
                    question: "رأس",
                    options: ["head", "hand", "leg"],
                    correctAnswer: 0
                },
                {
                    question: "صباح الخير",
                    options: ["good evening", "good afternoon", "good morning"],
                    correctAnswer: 2
                },
                {
                    question: "سيارة",
                    options: ["plane", "car", "bike"],
                    correctAnswer: 1
                },
                {
                    question: "قهوة",
                    options: ["coffee", "tea", "juice"],
                    correctAnswer: 0
                },
                {
                    question: "منديل",
                    options: ["cap", "shirt", "towel"],
                    correctAnswer: 2
                },
                {
                    question: "طبيب",
                    options: ["patient", "doctor", "nurse"],
                    correctAnswer: 1
                },
                {
                    question: "ليل",
                    options: ["day", "night", "afternoon"],
                    correctAnswer: 1
                },
                {
                    question: "فم",
                    options: ["mouth", "teeth", "nile"],
                    correctAnswer: 0
                },
                {
                    question: "زهرة",
                    options: ["ground", "flower", "plant"],
                    correctAnswer: 1
                },
                {
                    question: "شارع",
                    options: ["street", "city", "bridge"],
                    correctAnswer: 0
                },
                {
                    question: "مدرسة",
                    options: ["restaurant", "college", "school"],
                    correctAnswer: 2
                },
                {
                    question: "سوق",
                    options: ["market", "place", "field"],
                    correctAnswer: 0
                },
                {
                    question: "مكتبة",
                    options: ["office", "program", "student"],
                    correctAnswer: 0
                },
                {
                    question: "قاعة",
                    options: ["playground", "hall", "science"],
                    correctAnswer: 1
                },
                {
                    question: "لحم",
                    options: ["egg", "meat", "milk"],
                    correctAnswer: 1
                },
                {
                    question: "شرطي",
                    options: ["postman", "engineer", "police"],
                    correctAnswer: 2
                },
                {
                    question: "مطبخ",
                    options: ["garden", "kitchen", "market"],
                    correctAnswer: 1
                },
                {
                    question: "بئر",
                    options: ["river", "sea", "well"],
                    correctAnswer: 2
                },
                {
                    question: "قرية",
                    options: ["village", "city", "town"],
                    correctAnswer: 0
                },
                {
                    question: "غابة",
                    options: ["garden", "field", "forest"],
                    correctAnswer: 2
                }
            ],
            
            // 9. Urdu
            "9": [
                {
                    question: "چوتھا",
                    options: ["5th", "4th", "6th"],
                    correctAnswer: 1
                },
                {
                    question: "چھٹا",
                    options: ["4th", "8th", "6th"],
                    correctAnswer: 2
                },
                {
                    question: "ساتواں",
                    options: ["3rd", "9th", "7th"],
                    correctAnswer: 2
                },
                {
                    question: "آدھا",
                    options: ["1/2", "1/4", "3/4"],
                    correctAnswer: 0
                },
                {
                    question: "پونا",
                    options: ["1/2", "1/4", "3/4"],
                    correctAnswer: 2
                },
                {
                    question: "ساڑھے",
                    options: ["1 1/2", "2 1/2", "3 1/2"],
                    correctAnswer: 0
                },
                {
                    question: "تھائی",
                    options: ["3/4", "4/5", "2/3"],
                    correctAnswer: 2
                },
                {
                    question: "چوتھائی",
                    options: ["1/4", "1/3", "2/3"],
                    correctAnswer: 0
                },
                {
                    question: "سوا",
                    options: ["1 1/3", "2 1/2", "1 1/4"],
                    correctAnswer: 2
                },
                {
                    question: "پچاس",
                    options: ["45", "50", "55"],
                    correctAnswer: 1
                },
                {
                    question: "چونسٹھ",
                    options: ["84", "74", "64"],
                    correctAnswer: 2
                },
                {
                    question: "تہتر",
                    options: ["43", "73", "52"],
                    correctAnswer: 1
                },
                {
                    question: "چھیاسی",
                    options: ["46", "86", "36"],
                    correctAnswer: 1
                },
                {
                    question: "نواسی",
                    options: ["99", "89", "49"],
                    correctAnswer: 1
                },
                {
                    question: "اٹھانوے",
                    options: ["98", "79", "59"],
                    correctAnswer: 0
                },
                {
                    question: "تریپن",
                    options: ["33", "53", "73"],
                    correctAnswer: 1
                },
                {
                    question: "چھیالیس",
                    options: ["46", "64", "74"],
                    correctAnswer: 0
                },
                {
                    question: "چھتیس",
                    options: ["36", "83", "28"],
                    correctAnswer: 0
                },
                {
                    question: "گیارہ",
                    options: ["11", "12", "13"],
                    correctAnswer: 0
                },
                {
                    question: "انیس",
                    options: ["29", "69", "19"],
                    correctAnswer: 2
                }
            ],
            
            // 10. Malayalam
            "10": [
                {
                    question: "ആധുനിക മലയാള സാഹിത്യത്തിന്റെ പിതാവ് എന്നറിയപ്പെടുന്നത് ആരാണ്?",
                    options: ["തകഴി", "ബഷീർ", "എം ട്ടി വാസുദേവൻ"],
                    correctAnswer: 0
                },
                {
                    question: "1965-ൽ ജ്ഞാനപീഠ പുരസ്കാരം നേടിയ മലയാളത്തിലെ പ്രശസ്ത കവി?",
                    options: ["കെ സച്ചിദാനന്ദൻ", "ജി ശങ്കര കുറുപ്പ്", "ഒ എൻ വി കുറുപ്പ്"],
                    correctAnswer: 1
                },
                {
                    question: "പ്രശസ്ത മലയാള നോവലായ 'ചെമ്മീൻ' എഴുതിയത് ആരാണ്?",
                    options: ["കമല സുരയ്യ", "തകഴി", "ഒ എൻ വി കുറുപ്പ്"],
                    correctAnswer: 1
                },
                {
                    question: "ബാല്യകാലസഖി' എന്ന കൃതിയിലൂടെ പ്രശസ്തനായ മലയാള എഴുത്തുകാരൻ?",
                    options: ["ബഷീർ", "എം ട്ടി വാസുദേവൻ", "ജി ശങ്കര കുറുപ്പ്"],
                    correctAnswer: 0
                },
                {
                    question: "പ്രശസ്ത മലയാള നോവലായ 'നാലുകെട്ട്' എഴുതിയത് ആരാണ്?",
                    options: ["വൈലോപ്പിള്ളി", "എം ട്ടി വാസുദേവൻ", "അരുന്ധതി റോയ്"],
                    correctAnswer: 1
                },
                {
                    question: "രണ്ടിടങ്ങഴി' എന്ന കൃതിയിലൂടെ പ്രശസ്തനായ മലയാള എഴുത്തുകാരൻ?",
                    options: ["തകഴി", "ആർ കെ നാരായണൻ", "കമല സുരയ്യ"],
                    correctAnswer: 0
                },
                {
                    question: "ഖസക്കിൻ്റെ ഇതിഹാസം' എന്ന പ്രശസ്ത മലയാള നോവലിൻ്റെ രചയിതാവ് ആരാണ്?",
                    options: ["അരുന്ധതി റോയ്", "ഒ വി വിജയൻ", "ആർ കെ നാരായണൻ"],
                    correctAnswer: 1
                },
                {
                    question: "ഒരു ദേശത്തിന്റെ കഥ' എന്ന കൃതിയിലൂടെ പ്രശസ്തനായ മലയാള എഴുത്തുകാരൻ?",
                    options: ["ഒ എൻ വി കുറുപ്പ്", "തകഴി", "എസ് കെ പൊറ്റക്കാട്"],
                    correctAnswer: 2
                },
                {
                    question: "നാലുകെട്ട് എന്ന പ്രശസ്ത മലയാള നോവലിൻ്റെ രചയിതാവ് ആരാണ്??",
                    options: ["എസ് കെ പൊറ്റക്കാട്", "ജുംപ ലാഹിരി", "എം ട്ടി വാസുദേവൻ"],
                    correctAnswer: 2
                },
                {
                    question: "കുന്ദലത' എന്ന കൃതിയിലൂടെ പ്രശസ്തനായ മലയാള എഴുത്തുകാരൻ?",
                    options: ["അപ്പു നെടുങ്ങാടി", "വെയ്ലോപ്പിള്ളി", "ഒ എൻ വി കുറുപ്പ്"],
                    correctAnswer: 0
                },
                {
                    question: "മലയാളത്തിലെ ആദ്യത്തെ നോവൽ ഏതാണ്?",
                    options: ["കുറ്റി", "അടുത്തത്", "കുണ്ഠിലിനി"],
                    correctAnswer: 0
                },
                {
                    question: "ആരോഹണം എഴുതിയത് ആരാണ്?",
                    options: ["കുമാരനാശാൻ", "വി കെ എൻ", "ഒ വി വിജയൻ"],
                    correctAnswer: 1
                },
                {
                    question: "ആരാണ് കുട്ടനാടിന്റെ ഇതിഹാസ കാരൻ",
                    options: ["തുഞ്ചത്തെഴുത്തച്ഛൻ", "തകഴി", "ബഷീർ"],
                    correctAnswer: 1
                },
                {
                    question: "മലയാളത്തിൽ 'ലക്ഷണമോഹ' നോവൽ എന്നറിയപ്പെടുന്നത് ഏത്?",
                    options: ["കുന്ദലത", "അടുത്തത്", "ഷാരധ"],
                    correctAnswer: 1
                },
                {
                    question: "പാത്തുമ്മയുടെ ആടു' എഴുതിയത് ആരാണ്?",
                    options: ["ബഷീർ", "ഉറൂബ്", "ഫിറോസ്"],
                    correctAnswer: 0
                },
                {
                    question: "സ്നാനം എന്നതിന്റെ അർത്ഥം",
                    options: ["പോവുക", "കുളിക്കുക", "തബസ്സിരിക്കുക"],
                    correctAnswer: 1
                },
                {
                    question: "അഭിഷേകം എന്നതിന്റെ അർത്ഥം",
                    options: ["ഊഹം", "സ്വപ്നം", "ഒഴിക്കുക"],
                    correctAnswer: 2
                },
                {
                    question: "ലത എന്നാൽ എന്ത്",
                    options: ["വേര്", "തണ്ട്", "വള്ളി"],
                    correctAnswer: 2
                },
                {
                    question: "ഒരമ്മ പെറ്റ പന്തിര കുലത്തിലെ കഥാപാത്രം",
                    options: ["ബിജു", "നാറാണത് ഭ്രാന്തൻ", "സ്വാമി"],
                    correctAnswer: 1
                },
                {
                    question: " 'ഞാൻ അവനെ അടിച്ചു' എന്നതിൽ ക്രിയ ഏതാണ്?",
                    options: ["ഞാൻ", "അവനെ", "അടിച്ചു"],
                    correctAnswer: 2
                }
            ],
            
            // 11. English
            "11": [
                {
                    question: "he was a good fighter. what is he?",
                    options: ["noun", "pronoun", "adjective"],
                    correctAnswer: 1
                },
                {
                    question: "soldier killed enemy. select the verb from this",
                    options: ["killed", "soldier", "enemy"],
                    correctAnswer: 0
                },
                {
                    question: "rashid went to school. which noun used here as subject",
                    options: ["to", "school", "rashid"],
                    correctAnswer: 2
                },
                {
                    question: "Bakreed is my favourite day of the year. Which word is the proper noun?",
                    options: ["Bakreed", "year", "my"],
                    correctAnswer: 0
                },
                {
                    question: "The dog ran across the farmyard. select the preposition",
                    options: ["across", "the", "farmyard"],
                    correctAnswer: 0
                },
                {
                    question: "We bought a black cat from the Pets At Home. Which word is the adjective?",
                    options: ["pet", "black", "bought"],
                    correctAnswer: 1
                },
                {
                    question: "Sufyan is singing his favourite song. Which word is the verb?",
                    options: ["is", "favorite", "singing"],
                    correctAnswer: 2
                },
                {
                    question: "I heared a beautiful Qur'an recitation. which word is adjective?",
                    options: ["beautiful", "recitation", "Qur'an"],
                    correctAnswer: 0
                },
                {
                    question: "We went to Hyderabad on wednesday. What type of word is Wednesday?",
                    options: ["noun", "pronoun", "adjective"],
                    correctAnswer: 0
                },
                {
                    question: "The happy frog leaped from leaf to leaf in the pond. What type of word is happy?",
                    options: ["adverb", "preposition", "adjective"],
                    correctAnswer: 2
                },
                {
                    question: "The train reached in Kuttippuram fastly. what type of word is fastly?",
                    options: ["adjective", "conjunction", "adverb"],
                    correctAnswer: 2
                },
                {
                    question: "That car is driving very quickly. which word is adverb in this?",
                    options: ["quickly", "driving", "is"],
                    correctAnswer: 0
                },
                {
                    question: "Birds migrate when it gets cold. Which word is the noun?",
                    options: ["cold", "birds", "when"],
                    correctAnswer: 1
                },
                {
                    question: "He was my old friend. Which word is the pronoun?",
                    options: ["my", "old", "he"],
                    correctAnswer: 2
                },
                {
                    question: "Adam swam amazingly to win a gold medal in the Olympics. What type of word is amazingly?",
                    options: ["interjection", "conjunction", "adverb"],
                    correctAnswer: 2
                },
                {
                    question: "The teacher always tried to solve that problem. What type of word is always?",
                    options: ["verb", "adverb", "adjective"],
                    correctAnswer: 1
                },
                {
                    question: "The boy was happy because he was going fishing with his dad. Which word is the pronoun?",
                    options: ["he", "was", "with"],
                    correctAnswer: 0
                },
                {
                    question: "Suhail gave a gift to teacher. which word is the preposition?",
                    options: ["a", "to", "gave"],
                    correctAnswer: 1
                },
                {
                    question: "rasheed requested to move side. what type of word is requested?",
                    options: ["adverb", "verb", "adjective"],
                    correctAnswer: 1
                },
                {
                    question: "I will go to Delhi. Which word is the proper noun?",
                    options: ["I", "go", "Delhi"],
                    correctAnswer: 2
                }
            ],
            
            // 12. Hindi
            "12": [
                {
                    question: "Select the correct (नमस्ते)",
                    options: ["hello", "welcome", "thanks"],
                    correctAnswer: 0
                },
                {
                    question: "Select the correct (स्वागत)",
                    options: ["good bye", "see you", "welcome"],
                    correctAnswer: 2
                },
                {
                    question: "Select the correct (धन्यवाद)",
                    options: ["please", "thank you", "sorry"],
                    correctAnswer: 0
                },
                {
                    question: "Select the correct (माफ़ करना)",
                    options: ["little", "good afternoon", "sorry"],
                    correctAnswer: 2
                },
                {
                    question: "Select the correct (सुसंध्या)",
                    options: ["good morning", "good evening", "good night"],
                    correctAnswer: 1
                },
                {
                    question: "Select the correct (फिर मिलेंगे)",
                    options: ["see you", "good bye", "tomorrow"],
                    correctAnswer: 0
                },
                {
                    question: "Select the correct (सुंदर)",
                    options: ["fast", "beautiful", "revenge"],
                    correctAnswer: 1
                },
                {
                    question: "Select the correct (आशा)",
                    options: ["need", "hope", "today"],
                    correctAnswer: 1
                },
                {
                    question: "Select the correct (रैना)",
                    options: ["day", "night", "evening"],
                    correctAnswer: 1
                },
                {
                    question: "Select the correct (चलो)",
                    options: ["let's go", "stop there", "running"],
                    correctAnswer: 0
                },
                {
                    question: "Select the correct (रुको)",
                    options: ["bye", "stop", "super"],
                    correctAnswer: 1
                },
                {
                    question: "Select the correct (अच्छा)",
                    options: ["good", "bad", "nothing"],
                    correctAnswer: 0
                },
                {
                    question: "Select the correct (खाना)",
                    options: ["water", "juice", "food"],
                    correctAnswer: 2
                },
                {
                    question: "Select the correct (आज)",
                    options: ["today", "yesterday", "tomorrow"],
                    correctAnswer: 0
                },
                {
                    question: "Select the correct (खेलो)",
                    options: ["eat", "drink", "play"],
                    correctAnswer: 2
                },
                {
                    question: "Select the correct (पानी)",
                    options: ["grape", "water", "orange"],
                    correctAnswer: 1
                },
                {
                    question: "Select the correct (भाई)",
                    options: ["mom", "brother", "bap"],
                    correctAnswer: 1
                },
                {
                    question: "Select the correct (बहन)",
                    options: ["daughter", "mom", "sister"],
                    correctAnswer: 2
                },
                {
                    question: "Select the correct (परिवार)",
                    options: ["school", "family", "market"],
                    correctAnswer: 1
                },
                {
                    question: "Select the correct (मोहब्बत)",
                    options: ["hate", "ego", "love"],
                    correctAnswer: 2
                }
            ],
            
            // 13. Mathematics
            "13": [
                {
                    question: "6+5?",
                    options: ["20", "13", "11"],
                    correctAnswer: 2
                },
                {
                    question: "7+18?",
                    options: ["25", "31", "22"],
                    correctAnswer: 0
                },
                {
                    question: "6×7?",
                    options: ["54", "38", "42"],
                    correctAnswer: 2
                },
                {
                    question: "25+39?",
                    options: ["74", "64", "58"],
                    correctAnswer: 1
                },
                {
                    question: "12÷3?",
                    options: ["4", "3", "6"],
                    correctAnswer: 0
                },
                {
                    question: "56÷7?",
                    options: ["6", "7", "8"],
                    correctAnswer: 2
                },
                {
                    question: "80÷8?",
                    options: ["11", "10", "9"],
                    correctAnswer: 1
                },
                {
                    question: "72-9?",
                    options: ["63", "58", "61"],
                    correctAnswer: 0
                },
                {
                    question: "44-7?",
                    options: ["35", "37", "39"],
                    correctAnswer: 1
                },
                {
                    question: "60-13?",
                    options: ["37", "57", "47"],
                    correctAnswer: 2
                },
                {
                    question: "2,4,6,8,_?",
                    options: ["10", "12", "9"],
                    correctAnswer: 0
                },
                {
                    question: "7,10,13,16,_?",
                    options: ["18", "19", "20"],
                    correctAnswer: 1
                },
                {
                    question: "2,0,-2,-4,_?",
                    options: ["-3", "-5", "-6"],
                    correctAnswer: 2
                },
                {
                    question: "-4,8,16,_?",
                    options: ["24", "20", "26"],
                    correctAnswer: 0
                },
                {
                    question: "3/7+4/7?",
                    options: ["6/7", "7/7", "8/7"],
                    correctAnswer: 1
                },
                {
                    question: "5/8+2/8?",
                    options: ["6/8", "7/8", "8/8"],
                    correctAnswer: 1
                },
                {
                    question: "1/4,1/2  which is the great?",
                    options: ["1/4", "both are equal", "1/2"],
                    correctAnswer: 2
                },
                {
                    question: "3/4,6/12 which is the great?",
                    options: ["both are equal", "3/4", "6/12"],
                    correctAnswer: 1
                },
                {
                    question: "3 1/4 =?",
                    options: ["12/4", "13/4", "11/4"],
                    correctAnswer: 1
                },
                {
                    question: "100×100?",
                    options: ["10,000", "1,00,000", "10,00,000"],
                    correctAnswer: 0
                }
            ],
            
            // 14. Social science
            "14": [
                {
                    question: "What is history?",
                    options: ["Study of stars", "Study of past events", "Study of animals"],
                    correctAnswer: 1
                },
                {
                    question: "Who are archaeologists?",
                    options: ["People who write books", "People who study old coins and buildings", "People who make laws"],
                    correctAnswer: 1
                },
                {
                    question: "What are manuscripts?",
                    options: ["Printed books", "Newspaper articles", "Handwritten records"],
                    correctAnswer: 2
                },
                {
                    question: "The word 'India' comes from which river's name?",
                    options: ["Ganga", "Narmada", "Indus"],
                    correctAnswer: 2
                },
                {
                    question: "The earliest people lived near which type of place?",
                    options: ["rivers", "mountains", "deserts"],
                    correctAnswer: 0
                },
                {
                    question: "What does BC stand for in history?",
                    options: ["Before Coffee", "Before Christ", "Before Calendar"],
                    correctAnswer: 1
                },
                {
                    question: "What did early humans use for tools?",
                    options: ["iron", "plastic", "stone"],
                    correctAnswer: 2
                },
                {
                    question: "In which age did people start farming?",
                    options: ["ice age", "stone age", "modern age"],
                    correctAnswer: 1
                },
                {
                    question: "Which material was used to make tools in the Neolithic age?",
                    options: ["Bronze", "Plastic", "Polished stone"],
                    correctAnswer: 2
                },
                {
                    question: "The Harappan cities were known for their:",
                    options: ["Big markets", "Planned layout and drainage system", "Temples"],
                    correctAnswer: 1
                },
                {
                    question: "Which animal was important in Harappan culture?",
                    options: ["tiger", "elephant", "bull"],
                    correctAnswer: 2
                },
                {
                    question: "Who discovered Harappa?",
                    options: ["R.D. Banerji", "Ashoka", "Mourya"],
                    correctAnswer: 0
                },
                {
                    question: "Vedas are written in which language?",
                    options: ["Tamil", "Hindi", "Sanskrit"],
                    correctAnswer: 2
                },
                {
                    question: "Which Veda is the oldest?",
                    options: ["Sama Veda", "Rigveda", "Yajur Veda"],
                    correctAnswer: 1
                },
                {
                    question: "Who composed the Rigveda?",
                    options: ["Farmers", "priests", "kings"],
                    correctAnswer: 1
                },
                {
                    question: "The Janapadas were:",
                    options: ["Forests", "Villages", "Small kingdoms"],
                    correctAnswer: 2
                },
                {
                    question: "Magadha was located in which part of India?",
                    options: ["North-East", "South", "West"],
                    correctAnswer: 0
                },
                {
                    question: "Ashoka belonged to which dynasty?",
                    options: ["Maurya", "Gupta", "Mughal"],
                    correctAnswer: 0
                },
                {
                    question: "Who was the founder of Buddhism?",
                    options: ["Mahavira", "Ashoka", "Gautama Buddha"],
                    correctAnswer: 2
                },
                {
                    question: "What does AD stand for?",
                    options: ["After Date", "Anno Domini", "Ancient Day"],
                    correctAnswer: 1
                }
            ],
            
            // 15. IT
            "15": [
                {
                    question: "What does IT stand for?",
                    options: ["Internet Team", "Information Technology", "Internal Tool"],
                    correctAnswer: 1
                },
                {
                    question: "Which device is used to input data into a computer?",
                    options: ["Monitor", "Keyboard", "Printer"],
                    correctAnswer: 1
                },
                {
                    question: "What is the brain of the computer?",
                    options: ["Monitor", "UPS", "CPU"],
                    correctAnswer: 2
                },
                {
                    question: "Which one is an output device?",
                    options: ["Mouse", "Scanner", "Printer"],
                    correctAnswer: 2
                },
                {
                    question: "Which of the following stores data permanently?",
                    options: ["RAM", "Hard Disk", "ROM"],
                    correctAnswer: 1
                },
                {
                    question: "What does CPU stand for?",
                    options: ["Central Processing Unit", "Computer Power Unit", "Control Program Unit"],
                    correctAnswer: 0
                },
                {
                    question: "Which software helps to browse the internet?",
                    options: ["MS Word", "Chrome", "Paint"],
                    correctAnswer: 1
                },
                {
                    question: "What is the full form of URL?",
                    options: ["Uniform Resource Locator", "Universal Record Link", "Unique Reference Link"],
                    correctAnswer: 0
                },
                {
                    question: "What is the full form of Wi-Fi?",
                    options: ["Wireless Finder", "Wide Fidelity", "Wireless Fidelity"],
                    correctAnswer: 2
                },
                {
                    question: "Which device is used to click and select on screen?",
                    options: ["Keyboard", "CPU", "Mouse"],
                    correctAnswer: 2
                },
                {
                    question: "What is software?",
                    options: ["A physical part", "A program that runs on a computer", "A storage device"],
                    correctAnswer: 1
                },
                {
                    question: "What is an example of an operating system?",
                    options: ["Windows", "Google", "Excel"],
                    correctAnswer: 0
                },
                {
                    question: "What does HTTP stand for?",
                    options: ["Hyper Type Text Protocol", "Hypertext Transfer Protocol", "Home Transfer Text Program"],
                    correctAnswer: 1
                },
                {
                    question: "Which part displays the output?",
                    options: ["Monitor", "Speaker", "Headset"],
                    correctAnswer: 0
                },
                {
                    question: "What is the main page of a website called?",
                    options: ["Link page", "First page", "Home page"],
                    correctAnswer: 2
                },
                {
                    question: "What is the use of MS Word?",
                    options: ["Watching movies", "Making documents", "Listening to music"],
                    correctAnswer: 1
                },
                {
                    question: "What is the full form of PDF?",
                    options: ["Portable Document Format", "Print Document File", "Page Data Format"],
                    correctAnswer: 0
                },
                {
                    question: "Which of these is a search engine?",
                    options: ["Gmail", "Google", "YouTube"],
                    correctAnswer: 1
                },
                {
                    question: "What does RAM stand for?",
                    options: ["Read Access Memory", "Random Access Memory", "Random Application Module"],
                    correctAnswer: 1
                },
                {
                    question: "Who is known as the 'Father of the Computer'?",
                    options: ["Charles Babbage", "Alan Turing", "Bill Gates"],
                    correctAnswer: 0
                }
            ],
            
            // 16. Science
            "16": [
                {
                    question: "What do plants need to make food?",
                    options: ["Sunlight", "Moonlight", "Wind"],
                    correctAnswer: 0
                },
                {
                    question: "Which gas do we breathe in to stay alive?",
                    options: ["Oxygen", "Carbon dioxide", "Nitrogen"],
                    correctAnswer: 0
                },
                {
                    question: "What is the name of our galaxy?",
                    options: ["Milky Way", "Andromeda", "Triangulum"],
                    correctAnswer: 0
                },
                {
                    question: "Water boils at:",
                    options: ["0°C", "50°C", "100°C"],
                    correctAnswer: 2
                },
                {
                    question: "Which part of the plant absorbs water?",
                    options: ["Leaf", "Root", "Flower"],
                    correctAnswer: 1
                },
                {
                    question: "The Earth revolves around the:",
                    options: ["Moon", "Sun", "Mars"],
                    correctAnswer: 1
                },
                {
                    question: "The hardest natural substance is:",
                    options: ["Gold", "Iron", "Diamond"],
                    correctAnswer: 2
                },
                {
                    question: "Which phenomenon occurs when the Moon passes between the Sun and Earth?",
                    options: ["Transit", "Lunar eclipse", "Solar eclipse"],
                    correctAnswer: 2
                },
                {
                    question: "Which organ pumps blood in our body?",
                    options: ["Lungs", "Heart", "Brain"],
                    correctAnswer: 1
                },
                {
                    question: "Which planet is known as the 'Red Planet'?",
                    options: ["Mars", "Venus", "Jupiter"],
                    correctAnswer: 0
                },
                {
                    question: "What do we use to see tiny things?",
                    options: ["Telescope", "Microscope", "Camera"],
                    correctAnswer: 1
                },
                {
                    question: "Which of the following is a solid?",
                    options: ["Milk", "Stone", "Water"],
                    correctAnswer: 1
                },
                {
                    question: "What is the study of the universe beyond Earth's atmosphere called?",
                    options: ["Science", "Astrology", "Cosmology"],
                    correctAnswer: 0
                },
                {
                    question: "Which of these is a sense organ?",
                    options: ["Hair", "Bone", "Nose"],
                    correctAnswer: 2
                },
                {
                    question: "How many bones are there in an adult human body?",
                    options: ["300", "206", "258"],
                    correctAnswer: 1
                },
                {
                    question: "Which vitamin do we get from sunlight?",
                    options: ["Vitamin C", "Vitamin D", "Vitamin A"],
                    correctAnswer: 1
                },
                {
                    question: "What is H2O?",
                    options: ["Salt", "Oxygen", "Water"],
                    correctAnswer: 2
                },
                {
                    question: "Which is a liquid?",
                    options: ["Ice", "Steam", "Milk"],
                    correctAnswer: 2
                },
                {
                    question: "What is a black hole?",
                    options: ["A region of space with gravity so strong that nothing can escape", "A type of star", "An empty region in space"],
                    correctAnswer: 0
                },
                {
                    question: "What helps plants to grow?",
                    options: ["Rocks, plastic, wind", "Cement, water, sun", "Soil, water, sunlight"],
                    correctAnswer: 2
                }
            ]
};

function setUserState(chatId, state) {
  CONFIG.USER_STATE.setProperty(String(chatId), JSON.stringify(state));
}

function getUserState(chatId) {
  const state = CONFIG.USER_STATE.getProperty(String(chatId));
  return state ? JSON.parse(state) : null;
}

function clearUserState(chatId) {
  CONFIG.USER_STATE.deleteProperty(String(chatId));
}

// Subject names mapping
const subjectNames = {
  "1": "Qur'an",
  "2": "Hadith", 
  "3": "Fiqh",
  "4": "Thareeq",
  "5": "Nahv",
  "6": "Swarf",
  "7": "Tasawwuf",
  "8": "Arabic",
  "9": "Urdu",
  "10": "Malayalam",
  "11": "English",
  "12": "Hindi",
  "13": "Mathematics",
  "14": "Social Science",
  "15": "IT",
  "16": "Science"
};

// Map to keep track of user quiz sessions in memory
const quizSessions = new Map();

// ==================== RESPONSE TEMPLATES ====================
const MESSAGES = {
  START_WELCOME: `🎉 <b>Welcome to QUAF DHDC!</b>

Thank you for joining our community! We're excited to connect with you.

📢 Stay updated with our latest news and updates:`,

  SOCIAL_FACEBOOK: `📘 <b>Follow us on Facebook</b>

Join our Facebook community for daily updates, news, and engaging content!

👥 Connect with thousands of like-minded people and stay in the loop.`,

  SOCIAL_WHATSAPP: `💬 <b>Join our WhatsApp</b>

Get instant updates and direct communication through WhatsApp!

📱 Receive exclusive messages and quick notifications.`,

  SOCIAL_INSTAGRAM: `📸 <b>Follow us on Instagram</b>

Discover our visual stories, behind-the-scenes content, and inspiring posts!

✨ Don't miss our daily stories and photo updates.`,

  SOCIAL_YOUTUBE: `🎥 <b>Subscribe to our YouTube Channel</b>

Watch our latest videos, tutorials, and exclusive content!

🔔 Hit the bell icon to get notified of new uploads.`,

  SOCIAL_THREADS: `🧵 <b>Connect on Threads</b>

Join our conversations on Meta's newest social platform!

💭 Engage with our community in real-time discussions.`,

  SOCIAL_TELEGRAM: `📱 <b>Join our Telegram Channel</b>

Get real-time updates and announcements directly in Telegram!

⚡ Never miss important news and exclusive content.`,

  SOCIAL_CONTACT: `📞 <b>Contact Us Directly</b>

Need immediate assistance? Call us directly!

🎧 Our support team is ready to help you.`,

  PHONE_REQUEST: `📱 <b>Complete Your Registration</b>

To provide you with personalized updates and support, please share your phone number.

🔒 <i>Your information is completely secure and will only be used for important communications.</i>

👇 Click the button below to share your contact:`,

  CONTACT_SUCCESS: `✅ <b>Registration Complete!</b>

📱 Phone: <code>{PHONE}</code>
👤 Name: <b>{NAME}</b>

Thank you for sharing your contact! Our team will reach out when needed.

🎉 You're now part of our exclusive community!`,

  WELCOME_BACK: `👋 <b>Welcome Back!</b>

Great to see you again! You're already registered in our system.

📢 Check out our social media for the latest updates:`,

  QUIZ_WELCOME: `🧠 <b>Welcome to QUAF DHDC Quiz!</b>

Test your knowledge across multiple subjects.

Select a subject to start your quiz:`,

  ERROR_GENERIC: `⚠️ <b>Temporary Error</b>

We're experiencing a brief technical issue. Please try again in a moment.

If the problem persists, contact our support team.`,

  NO_SUBJECTS_LEFT: `🎉 <b>You have completed all available subjects!</b>

Here is your total score and percentage for all subjects.`,

  QUIZ_SUBJECT_SCORE: `📚 <b>{SUBJECT} Quiz Completed</b>

Your score: {SCORE}/{TOTAL}
Percentage: {PERCENTAGE}%`
};

// ==================== MAIN WEBHOOK HANDLER ====================
function doPost(e) {
  const startTime = new Date().getTime();

  try {
    const requestData = validateAndParseRequest(e);
    if (!requestData) {
      return createResponse("Invalid request format");
    }

    const messageData = parseMessageData(requestData.message || requestData.callback_query?.message);
    logDebugInfo("Incoming Message", messageData);

    if (requestData.callback_query) {
      handleCallbackQuery(requestData.callback_query);
    }
    else if (messageData.isStartCommand) {
      handleStartCommand(messageData);
    } else if (messageData.isContactMessage) {
      handleContactRegistration(messageData);
    } else if (messageData.isQuizCommand) {
      handleQuizCommand(messageData);
    } else if (messageData.isTextMessage) {
      handleTextMessage(messageData);
    } else {
      logDebugInfo("Unknown Message Type", messageData);
    }

    const endTime = new Date().getTime();
    console.log(`✅ Webhook processed successfully in ${endTime - startTime}ms`);

    return createResponse("OK");

  } catch (error) {
    console.error("🔴 Fatal webhook error:", error.toString());
    console.error("Stack trace:", error.stack);
    return createResponse("Error", 500);
  }
}

// ==================== REQUEST VALIDATION & PARSING ====================
function validateAndParseRequest(e) {
  if (!e || !e.postData || !e.postData.contents) {
    console.error("🔴 Invalid request structure");
    return null;
  }
  try {
    const data = JSON.parse(e.postData.contents);

    if (!data.message && !data.callback_query) {
      console.error("🔴 No message or callback_query in request");
      return null;
    }
    return data;
  } catch (parseError) {
    console.error("🔴 JSON parsing failed:", parseError.toString());
    return null;
  }
}

function parseMessageData(message) {
  if (!message) return { messageType: "unknown" };

  const baseData = {
    chatId: message.chat?.id,
    messageId: message.message_id,
    timestamp: new Date(),
    userName: buildUserName(message.from),
    text: message.text || "",

    isStartCommand: false,
    isContactMessage: false,
    isTextMessage: false,
    isQuizCommand: false,
    phone: "",

    messageType: "unknown",
    rawData: message
  };

  if (message.text && message.text.trim() === "/start") {
    baseData.isStartCommand = true;
    baseData.messageType = "start_command";
  }
  else if (message.text && message.text.trim() === "🧠 Quiz") {
    baseData.isQuizCommand = true;
    baseData.messageType = "quiz_command";
  }
  else if (message.contact && message.contact.phone_number) {
    baseData.isContactMessage = true;
    baseData.messageType = "contact";
    baseData.phone = cleanPhoneNumber(message.contact.phone_number);

    if (message.contact.first_name) {
      baseData.contactName = buildContactName(message.contact);
    }
  }
  else if (message.text) {
    baseData.isTextMessage = true;
    baseData.messageType = "text";

    const extractedPhone = extractPhoneFromText(message.text);
    if (extractedPhone) {
      baseData.phone = extractedPhone;
      baseData.messageType = "text_with_phone";
    }
  }

  return baseData;
}

// ==================== CALLBACK QUERY HANDLING ====================
function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const userName = buildUserName(callbackQuery.from);

  try {
    answerCallbackQuery(callbackQuery.id);

    // Handle quiz menu and subjects flow
    if (data === "quiz_menu") {
      sendSubjectsMenu(chatId);
    }
    else if (data.startsWith('subject_')) {
      const subjectId = data.replace('subject_', '');
      startSubjectQuiz(chatId, subjectId, userName);
    }
    else if (data.startsWith('answer_')) {
      handleSubjectAnswer(chatId, data, userName);
    }
    else if (data === "main_menu") {
      handleStartCommand({ chatId, userName: userName });
    }
    else {
      sendErrorMessage(chatId, "Unknown action. Please try again.");
    }

    console.log(`✅ Callback query processed: ${data} for user ${chatId}`);

  } catch (error) {
    console.error("🔴 Callback query processing failed:", error.toString());
    sendErrorMessage(chatId, "Quiz processing failed. Please try again.");
  }
}

function answerCallbackQuery(callbackQueryId) {
  const url = `${CONFIG.API_BASE_URL}${CONFIG.BOT_TOKEN}/answerCallbackQuery`;

  const payload = {
    callback_query_id: callbackQueryId,
  };

  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    UrlFetchApp.fetch(url, options);
  } catch (error) {
    console.error("🔴 answerCallbackQuery failed:", error.toString());
  }
}

// Handle quiz start from subject selection (e.g., "quiz_1")
if (callbackQuery && callbackQuery.data.startsWith("quiz_")) {
  const subjectId = callbackQuery.data.split("_")[1];
  const chatId = callbackQuery.message.chat.id;

  const questions = subjectQuestions[subjectId];
  if (!questions) return;

  const state = {
    subjectId,
    questionIndex: 0,
    score: 0
  };
  setUserState(chatId, state);

  sendQuizQuestion(chatId, questions[0], 0);
}

// Handle answer selection like "answer_2"
if (callbackQuery && callbackQuery.data.startsWith("answer_")) {
  const chatId = callbackQuery.message.chat.id;
  const selected = parseInt(callbackQuery.data.split("_")[1]);
  const state = getUserState(chatId);

  if (!state) return;

  const questions = subjectQuestions[state.subjectId];
  const current = questions[state.questionIndex];

  if (selected === current.correctAnswer) state.score++;

  state.questionIndex++;

  if (state.questionIndex < questions.length) {
    setUserState(chatId, state);
    sendQuizQuestion(chatId, questions[state.questionIndex], state.questionIndex);
  } else {
    // Quiz complete
    const percentage = Math.round((state.score / questions.length) * 100);
    const messageText = `✅ Quiz Complete!\nSubject: ${state.subjectId}\nScore: ${state.score}/${questions.length} (${percentage}%)`;

    sendMessage(chatId, messageText);
    logQuizResult(chatId, state.subjectId, state.score, questions.length, percentage);
    clearUserState(chatId);
  }
}
// ==================== QUIZ FLOW FUNCTIONS ====================
// When user clicks "🧠 Quiz" button or quiz_menu callback
function handleQuizCommand(messageData) {
  logDebugInfo("Processing Quiz Command", messageData);

  try {
    recordMessage({
      ...messageData,
      text: "🧠 Quiz button clicked"
    });

    // Initialize or reset session for new quiz round per user
    initializeQuizSession(messageData.chatId, messageData.userName);

    // Show subjects menu
    sendSubjectsMenu(messageData.chatId);

    console.log(`✅ Quiz command processed for user ${messageData.chatId}`);

  } catch (error) {
    console.error("🔴 Quiz command processing failed:", error.toString());
    sendErrorMessage(messageData.chatId, "Quiz menu failed to load. Please try again.");
  }
}

// Initialize quiz session details for user
function initializeQuizSession(chatId, userName) {
  // Copy all subject ids as remaining
  // Create empty Set for completed subjects
  const allSubjects = Object.keys(subjectNames);

  quizSessions.set(chatId, {
    userName: userName,
    completedSubjects: new Set(),
    remainingSubjects: [...allSubjects],
    currentSubjectId: null,
    currentSubjectScore: 0,
    currentSubjectQuestions: [],
    currentQuestionIndex: 0,
    cumulativeScore: 0,
    cumulativeTotal: 0
  });

  console.log(`🔄 Quiz session initialized for user ${chatId}`);
}

// Send subjects menu excluding completed subjects
function sendSubjectsMenu(chatId) {
  const session = quizSessions.get(chatId);
  if (!session) {
    sendErrorMessage(chatId, "Quiz session expired or not found. Please click Quiz to start again.");
    return;
  }

  // Filter remaining subjects from session.remainingSubjects excluding completed ones
  const remainingSubjects = session.remainingSubjects.filter(subjId => !session.completedSubjects.has(subjId));

  if (remainingSubjects.length === 0) {
    // All done - show total score summary and save total
    sendFinalResults(chatId);
    return;
  }

  // Build inline keyboard - two subjects per row
  const keyboard = [];
  for (let i = 0; i < remainingSubjects.length; i += 2) {
    const row = [];
    row.push({
      text: `📚 ${subjectNames[remainingSubjects[i]]}`,
      callback_data: `subject_${remainingSubjects[i]}`
    });

    if (i + 1 < remainingSubjects.length) {
      row.push({
        text: `📚 ${subjectNames[remainingSubjects[i + 1]]}`,
        callback_data: `subject_${remainingSubjects[i + 1]}`
      });
    }
    keyboard.push(row);
  }

  const payload = {
    chat_id: chatId,
    text: MESSAGES.QUIZ_WELCOME,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard }
  };

  sendTelegramMessage(payload);
}

// Start a subject quiz for user
function startSubjectQuiz(chatId, subjectId, userName) {
  const session = quizSessions.get(chatId);
  if (!session) {
    sendErrorMessage(chatId, "Quiz session expired or not found. Please click Quiz to start again.");
    return;
  }

  // Check if subject already completed:
  if (session.completedSubjects.has(subjectId)) {
    sendTelegramMessage({
      chat_id: chatId,
      text: `✅ You have already completed the subject <b>${subjectNames[subjectId]}</b>. Please select another subject.`,
      parse_mode: "HTML"
    });
    sendSubjectsMenu(chatId); // Reshow subjects menu
    return;
  }

  const questions = subjectQuestions[subjectId];
  if (!questions || questions.length === 0) {
    sendTelegramMessage({
      chat_id: chatId,
      text: "❌ Quiz questions not available for this subject yet. Please try another subject.",
      parse_mode: "HTML"
    });
    return;
  }

  session.currentSubjectId = subjectId;
  session.currentSubjectQuestions = questions;
  session.currentSubjectScore = 0;
  session.currentQuestionIndex = 0;

  sendQuizQuestion(chatId);
}

// Send the current question of the subject quiz
function sendQuizQuestion(chatId) {
  const session = quizSessions.get(chatId);
  if (!session) {
    sendErrorMessage(chatId, "Quiz session not found. Please start a new quiz.");
    return;
  }

  const question = session.currentSubjectQuestions[session.currentQuestionIndex];
  if (!question) {
    sendErrorMessage(chatId, "Question not found. Please restart the quiz.");
    return;
  }

  const questionNumber = session.currentQuestionIndex + 1;
  const totalQuestions = session.currentSubjectQuestions.length;

  const keyboard = question.options.map((option, index) => ([{
    text: `${String.fromCharCode(65 + index)}. ${option}`,
    callback_data: `answer_${session.currentSubjectId}_${session.currentQuestionIndex}_${index}`
  }]));

  const questionText = `🧠 <b>${subjectNames[session.currentSubjectId]} Quiz</b>
📊 Question ${questionNumber}/${totalQuestions}

❓ ${question.question}

Choose your answer:`;

  const payload = {
    chat_id: chatId,
    text: questionText,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard }
  };

  sendTelegramMessage(payload);
}

// Handle user's answer to a question in the subject quiz
function handleSubjectAnswer(chatId, answerData, userName) {
  const session = quizSessions.get(chatId);
  if (!session) {
    sendErrorMessage(chatId, "Quiz session not found. Please start a new quiz.");
    return;
  }

  const parts = answerData.split('_'); // answer_subjectId_questionIndex_selectedAnswerIndex
  if (parts.length !== 4) {
    sendErrorMessage(chatId, "Invalid answer data. Please restart the quiz.");
    return;
  }

  const subjectId = parts[1];
  const questionIndex = parseInt(parts[2], 10);
  const selectedAnswer = parseInt(parts[3], 10);

  // Validate subject and question index
  if (subjectId !== session.currentSubjectId || questionIndex !== session.currentQuestionIndex) {
    sendErrorMessage(chatId, "Answer out of sync, please restart the quiz.");
    quizSessions.delete(chatId);
    return;
  }

  const question = session.currentSubjectQuestions[questionIndex];
  const isCorrect = (selectedAnswer === question.correctAnswer);

  if (isCorrect) session.currentSubjectScore++;

  const resultEmoji = isCorrect ? "✅" : "❌";
  const correctOption = question.options[question.correctAnswer];

  let resultText = `${resultEmoji} ${isCorrect ? 'Correct!' : 'Wrong!'}\n\n`;
  resultText += `✔️ Correct Answer: ${correctOption}\n`;
  resultText += `📊 Your Score: ${session.currentSubjectScore}/${questionIndex + 1}`;

  // Send answer feedback message
  sendTelegramMessage({
    chat_id: chatId,
    text: resultText,
    parse_mode: "HTML"
  });

  session.currentQuestionIndex++;

  if (session.currentQuestionIndex < session.currentSubjectQuestions.length) {
    Utilities.sleep(1500);
    sendQuizQuestion(chatId);
  } else {
    // Subject quiz finished - record to sheet and update session info
    finishSubjectQuiz(chatId);
  }
}

// Handles finishing a subject quiz: save to sheet, notify user, update session
function finishSubjectQuiz(chatId) {
  const session = quizSessions.get(chatId);
  if (!session) return;

  const subjectId = session.currentSubjectId;
  const subjectName = subjectNames[subjectId];
  const score = session.currentSubjectScore;
  const total = session.currentSubjectQuestions.length;
  const percentage = Math.round((score / total) * 100);

  // Save subject result to Messages sheet (one sheet for all)
  saveQuizResult(chatId, session.userName, subjectId, subjectName, score, total, percentage);

  // Update cumulative scores
  session.cumulativeScore += score;
  session.cumulativeTotal += total;

  // Mark subject completed
  session.completedSubjects.add(subjectId);

  // Remove from remainingSubjects for safety
  session.remainingSubjects = session.remainingSubjects.filter(id => id !== subjectId);

  // Clear current subject quiz states
  session.currentSubjectId = null;
  session.currentSubjectQuestions = [];
  session.currentQuestionIndex = 0;
  session.currentSubjectScore = 0;

  // Notify user of subject result with option to continue
  let messageText = MESSAGES.QUIZ_SUBJECT_SCORE
    .replace('{SUBJECT}', subjectName)
    .replace('{SCORE}', score)
    .replace('{TOTAL}', total)
    .replace('{PERCENTAGE}', percentage.toString());

  const keyboard = [
    [
      { text: "🧠 Take Another Subject Quiz", callback_data: "quiz_menu" },
      { text: "🏠 Main Menu", callback_data: "main_menu" }
    ]
  ];

  sendTelegramMessage({
    chat_id: chatId,
    text: messageText,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard }
  });
}

// Final all subjects completed summary and save cumulative result
function sendFinalResults(chatId) {
  const session = quizSessions.get(chatId);
  if (!session) return;

  if (session.cumulativeTotal === 0) {
    sendTelegramMessage({
      chat_id: chatId,
      text: "❌ No quiz data found. Please start a new quiz session.",
      parse_mode: "HTML"
    });
    quizSessions.delete(chatId);
    return;
  }

  const totalScore = session.cumulativeScore;
  const totalPossible = session.cumulativeTotal;
  const totalPercentage = Math.round((totalScore / totalPossible) * 100);

  // Save overall result in Messages sheet with subject = 'Total Quiz Score'
  saveQuizResult(chatId, session.userName, "Total", "Total Quiz Score", totalScore, totalPossible, totalPercentage);

  let finalMessage = `🎉 <b>All Subjects Completed!</b>

📊 Total Score: ${totalScore}/${totalPossible}
📈 Overall Percentage: ${totalPercentage}%

`;

  if (totalPercentage >= 80) finalMessage += "🏆 Excellent! Outstanding performance!";
  else if (totalPercentage >= 60) finalMessage += "👍 Good job! Keep it up!";
  else if (totalPercentage >= 40) finalMessage += "📖 Not bad! More practice needed.";
  else finalMessage += "💪 Keep studying and try again!";

  const keyboard = [
    [
      { text: "🏠 Main Menu", callback_data: "main_menu" }
    ]
  ];

  sendTelegramMessage({
    chat_id: chatId,
    text: finalMessage,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard }
  });

  // Clear the session fully (end session)
  quizSessions.delete(chatId);
}

// Save individual or total quiz result to the same Messages sheet
function saveQuizResult(chatId, userName, subjectId, subjectName, score, total, percentage) {
  try {
    const sheet = getMessagesSheet();
    const timestamp = new Date();

    // Prepare row data aligning with configured columns (ensure length)
    const rowData = [];
    rowData[CONFIG.MESSAGES_COLUMNS.NAME] = userName || "Unknown";
    rowData[CONFIG.MESSAGES_COLUMNS.PHONE] = ""; // Phone not captured here
    rowData[CONFIG.MESSAGES_COLUMNS.CHAT_ID] = chatId || "";
    rowData[CONFIG.MESSAGES_COLUMNS.MESSAGE_ID] = ""; // No message ID for quiz results
    rowData[CONFIG.MESSAGES_COLUMNS.MESSAGE] = ""; // Can be left blank
    rowData[CONFIG.MESSAGES_COLUMNS.TIMESTAMP] = timestamp;
    rowData[CONFIG.MESSAGES_COLUMNS.SUBJECT] = subjectName;
    rowData[CONFIG.MESSAGES_COLUMNS.SCORE] = score;
    rowData[CONFIG.MESSAGES_COLUMNS.TOTAL] = total;
    rowData[CONFIG.MESSAGES_COLUMNS.PERCENTAGE] = percentage;

    sheet.appendRow(rowData);

    console.log(`📝 Quiz result saved: ChatID=${chatId} Subject=${subjectName} Score=${score}/${total} (${percentage}%)`);

  } catch (error) {
    console.error("🔴 Failed to save quiz result:", error.toString());
  }
}

// ==================== START COMMAND HANDLER ====================
function handleStartCommand(messageData) {
  logDebugInfo("Processing Start Command", messageData);

  try {
    recordMessage({
      ...messageData,
      text: "/start command"
    });

    const userStatus = checkUserRegistration(messageData.chatId);

    if (userStatus.isRegistered && userStatus.hasPhone) {
      sendRegisteredUserWelcome(messageData.chatId, messageData.userName);
    } else {
      sendStartWelcome(messageData.chatId);
      sendSocialMediaSequence(messageData.chatId);
    }

    console.log(`✅ Start command processed for user ${messageData.chatId}`);

  } catch (error) {
    console.error("🔴 Start command processing failed:", error.toString());
    sendErrorMessage(messageData.chatId, "Welcome message failed. Please try again.");
  }
}

function sendRegisteredUserWelcome(chatId, userName) {
  const welcomeText = `👋 <b>Welcome back, ${userName}!</b>

You're already registered in our system. Ready to test your knowledge?

🧠 Click the Quiz button below to start learning!`;

  const payload = {
    chat_id: chatId,
    text: welcomeText,
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [
        [{ text: "🧠 Quiz" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
      selective: true
    }
  };

  sendTelegramMessage(payload);
}

function sendStartWelcome(chatId) {
  const payload = {
    chat_id: chatId,
    text: MESSAGES.START_WELCOME,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{
          text: "🔔 Get Updates",
          url: CONFIG.TELEGRAM_CHANNEL
        }]
      ]
    }
  };

  sendTelegramMessage(payload);
}

function sendSocialMediaSequence(chatId) {
  const socialMediaMessages = [
    {
      text: MESSAGES.SOCIAL_FACEBOOK,
      button: "👥 Follow on Facebook",
      url: CONFIG.SOCIAL_MEDIA.FACEBOOK
    },
    {
      text: MESSAGES.SOCIAL_WHATSAPP,
      button: "💬 Join WhatsApp",
      url: CONFIG.SOCIAL_MEDIA.WHATSAPP
    },
    {
      text: MESSAGES.SOCIAL_INSTAGRAM,
      button: "📸 Follow on Instagram",
      url: CONFIG.SOCIAL_MEDIA.INSTAGRAM
    },
    {
      text: MESSAGES.SOCIAL_YOUTUBE,
      button: "🔔 Subscribe YouTube",
      url: CONFIG.SOCIAL_MEDIA.YOUTUBE
    },
    {
      text: MESSAGES.SOCIAL_THREADS,
      button: "🧵 Connect on Threads",
      url: CONFIG.SOCIAL_MEDIA.THREADS
    },
    {
      text: MESSAGES.SOCIAL_TELEGRAM,
      button: "📱 Join Telegram",
      url: CONFIG.SOCIAL_MEDIA.TELEGRAM
    },
    {
      text: MESSAGES.SOCIAL_CONTACT,
      button: "📞 Call Now",
      url: `tel:${CONFIG.SOCIAL_MEDIA.PHONE}`
    }
  ];

  socialMediaMessages.forEach((msg, index) => {
    if (index > 0) {
      Utilities.sleep(2000);
    }
    sendSocialMediaMessage(chatId, msg.text, msg.button, msg.url);
  });

  Utilities.sleep(2000);
  sendPhoneNumberRequest(chatId);
}

function sendSocialMediaMessage(chatId, text, buttonText, url) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{
          text: buttonText,
          url: url
        }]
      ]
    }
  };

  sendTelegramMessage(payload);
}

function sendPhoneNumberRequest(chatId) {
  const payload = {
    chat_id: chatId,
    text: MESSAGES.PHONE_REQUEST,
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [
        [{
          text: "📱 Share My Phone Number",
          request_contact: true
        }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
      selective: true
    }
  };

  sendTelegramMessage(payload);
}

// ==================== CONTACT REGISTRATION HANDLER ====================
function handleContactRegistration(messageData) {
  logDebugInfo("Processing Contact Registration", messageData);

  try {
    const registrationResult = updateUserRegistration(messageData);
    sendContactConfirmation(messageData, registrationResult);

    console.log(`✅ Contact registration completed for user ${messageData.chatId}`);

  } catch (error) {
    console.error("🔴 Contact registration failed:", error.toString());
    sendErrorMessage(messageData.chatId, "Registration failed. Please try again.");
  }
}

// ==================== TEXT MESSAGE HANDLER ====================
function handleTextMessage(messageData) {
  logDebugInfo("Processing Text Message", messageData);

  try {
    const userStatus = checkUserRegistration(messageData.chatId);

    recordMessage(messageData);

    if (userStatus.isRegistered && userStatus.hasPhone) {
      sendWelcomeBackMessage(messageData.chatId);
    } else {
      sendRegistrationPrompt(messageData.chatId);
    }

    console.log(`✅ Text message processed for user ${messageData.chatId} (Registered: ${userStatus.isRegistered}, HasPhone: ${userStatus.hasPhone})`);

  } catch (error) {
    console.error("🔴 Text message processing failed:", error.toString());
    sendErrorMessage(messageData.chatId, "Message processing failed. Please try again.");
  }
}

// ==================== USER REGISTRATION/DATABASE OPERATIONS ====================
function updateUserRegistration(messageData) {
  const sheet = getMessagesSheet();
  const data = sheet.getDataRange().getValues();

  let userRowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][CONFIG.MESSAGES_COLUMNS.CHAT_ID] === messageData.chatId) {
      userRowIndex = i;
      break;
    }
  }

  const rowData = [];
  rowData[CONFIG.MESSAGES_COLUMNS.NAME] = messageData.contactName || messageData.userName || "";
  rowData[CONFIG.MESSAGES_COLUMNS.PHONE] = messageData.phone || "";
  rowData[CONFIG.MESSAGES_COLUMNS.CHAT_ID] = messageData.chatId || "";
  rowData[CONFIG.MESSAGES_COLUMNS.MESSAGE_ID] = messageData.messageId || "";
  rowData[CONFIG.MESSAGES_COLUMNS.MESSAGE] = "Contact shared";
  rowData[CONFIG.MESSAGES_COLUMNS.TIMESTAMP] = messageData.timestamp || new Date();
  rowData[CONFIG.MESSAGES_COLUMNS.SUBJECT] = "";
  rowData[CONFIG.MESSAGES_COLUMNS.SCORE] = "";
  rowData[CONFIG.MESSAGES_COLUMNS.TOTAL] = "";
  rowData[CONFIG.MESSAGES_COLUMNS.PERCENTAGE] = "";

  if (userRowIndex > -1) {
    const range = sheet.getRange(userRowIndex + 1, 1, 1, rowData.length);
    range.setValues([rowData]);

    console.log(`📝 Updated existing user registration: ${messageData.chatId}`);
    return { isNew: false, rowIndex: userRowIndex };
  } else {
    sheet.appendRow(rowData);

    console.log(`📝 Created new user registration: ${messageData.chatId}`);
    return { isNew: true, rowIndex: data.length };
  }
}

function recordMessage(messageData) {
  const sheet = getMessagesSheet();

  const rowData = [];
  rowData[CONFIG.MESSAGES_COLUMNS.NAME] = messageData.userName || "";
  rowData[CONFIG.MESSAGES_COLUMNS.PHONE] = messageData.phone || "";
  rowData[CONFIG.MESSAGES_COLUMNS.CHAT_ID] = messageData.chatId || "";
  rowData[CONFIG.MESSAGES_COLUMNS.MESSAGE_ID] = messageData.messageId || "";
  rowData[CONFIG.MESSAGES_COLUMNS.MESSAGE] = messageData.text || "";
  rowData[CONFIG.MESSAGES_COLUMNS.TIMESTAMP] = messageData.timestamp || new Date();
  rowData[CONFIG.MESSAGES_COLUMNS.SUBJECT] = "";
  rowData[CONFIG.MESSAGES_COLUMNS.SCORE] = "";
  rowData[CONFIG.MESSAGES_COLUMNS.TOTAL] = "";
  rowData[CONFIG.MESSAGES_COLUMNS.PERCENTAGE] = "";

  sheet.appendRow(rowData);
  console.log(`📝 Message recorded for user: ${messageData.chatId}`);
}

function checkUserRegistration(chatId) {
  const sheet = getMessagesSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][CONFIG.MESSAGES_COLUMNS.CHAT_ID] === chatId) {
      const phoneValue = data[i][CONFIG.MESSAGES_COLUMNS.PHONE];
      const hasPhone = phoneValue &&
        phoneValue.toString().trim().length > 0 &&
        phoneValue.toString().trim() !== "" &&
        phoneValue.toString().trim().toLowerCase() !== "undefined";
      console.log(`📋 User ${chatId} found - Phone: "${phoneValue}" HasPhone: ${hasPhone}`);
      return {
        isRegistered: true,
        hasPhone: hasPhone,
        rowIndex: i,
        userData: data[i]
      };
    }
  }

  console.log(`📋 User ${chatId} not found in database`);
  return { isRegistered: false, hasPhone: false };
}

function getMessagesSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CONFIG.MESSAGES_SHEET);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.MESSAGES_SHEET);
    console.log(`📊 Created new sheet: ${CONFIG.MESSAGES_SHEET}`);

    // Add headers (extend columns for quiz)
    const headers = [
      'Name',
      'Phone',
      'Chat ID',
      'Message ID',
      'Message',
      'Timestamp',
      'Subject',
      'Score',
      'Total',
      'Percentage'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

// ==================== UTILITY & HELPER FUNCTIONS ====================
function buildUserName(user) {
  if (!user) return "Unknown User";

  const first = user.first_name || "";
  const last = user.last_name || "";
  const username = user.username ? `(@${user.username})` : "";

  return `${first} ${last} ${username}`.trim().replace(/\s+/g, ' ');
}

function buildContactName(contact) {
  const first = contact.first_name || "";
  const last = contact.last_name || "";
  return `${first} ${last}`.trim();
}

function cleanPhoneNumber(phone) {
  if (!phone) return "";
  let cleaned = phone.replace(/[^\d+]/g, '');
  cleaned = cleaned.replace(/(?!^)\+/g, '');

  if (cleaned.length >= 10 && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  if (cleaned.length < 10) {
    console.warn(`⚠️ Phone number too short: ${phone} -> ${cleaned}`);
  }

  return cleaned;
}

function extractPhoneFromText(text) {
  if (!text) return "";

  const patterns = [
    /(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,
    /(\+\d{1,4}[\s-]?)?(\d{1,4}[\s-]?){2,4}\d{1,4}/g
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return cleanPhoneNumber(matches[0]);
    }
  }

  return "";
}

// ==================== MESSAGING FUNCTIONS ====================
function sendContactConfirmation(messageData, registrationResult) {
  const messageText = MESSAGES.CONTACT_SUCCESS
    .replace('{PHONE}', messageData.phone)
    .replace('{NAME}', messageData.contactName || messageData.userName);

  const payload = {
    chat_id: messageData.chatId,
    text: messageText,
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [
        [{ text: "🧠 Quiz" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
      selective: true
    }
  };

  sendTelegramMessage(payload);
}

function sendRegistrationPrompt(chatId) {
  const payload = {
    chat_id: chatId,
    text: MESSAGES.PHONE_REQUEST,
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [
        [{
          text: "📱 Share My Phone Number",
          request_contact: true
        }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
      selective: true
    }
  };

  sendTelegramMessage(payload);
}

function sendWelcomeBackMessage(chatId) {
  const payload = {
    chat_id: chatId,
    text: MESSAGES.WELCOME_BACK,
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [
        [{ text: "🧠 Quiz" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
      selective: true
    }
  };

  sendTelegramMessage(payload);
}

function sendErrorMessage(chatId, customMessage = null) {
  const payload = {
    chat_id: chatId,
    text: customMessage || MESSAGES.ERROR_GENERIC,
    parse_mode: "HTML"
  };

  sendTelegramMessage(payload);
}

// ==================== TELEGRAM API INTERFACE ====================
function sendTelegramMessage(payload, retryCount = 0) {
  const url = `${CONFIG.API_BASE_URL}${CONFIG.BOT_TOKEN}/sendMessage`;

  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    timeout: CONFIG.TIMEOUT_MS
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode === 200) {
      console.log(`✅ Message sent successfully to chat ${payload.chat_id}`);
      return JSON.parse(responseText);
    } else {
      console.error(`🔴 Telegram API error ${responseCode}:`, responseText);

      if (retryCount < CONFIG.MAX_RETRIES && (responseCode >= 500 || responseCode === 429)) {
        console.log(`🔄 Retrying... Attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES}`);
        Utilities.sleep(1000 * (retryCount + 1));
        return sendTelegramMessage(payload, retryCount + 1);
      }

      return { error: true, code: responseCode, message: responseText };
    }

  } catch (networkError) {
    console.error("🔴 Network error:", networkError.toString());

    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`🔄 Retrying network request... Attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES}`);
      Utilities.sleep(2000 * (retryCount + 1));
      return sendTelegramMessage(payload, retryCount + 1);
    }

    return { error: true, message: networkError.toString() };
  }
}

// ==================== UTILITIES ====================
function createResponse(message, statusCode = 200) {
  return ContentService
    .createTextOutput(message)
    .setMimeType(ContentService.MimeType.TEXT);
}

function logDebugInfo(title, data) {
  console.log(`🔍 ${title}:`);
  console.log(JSON.stringify(data, null, 2));
}

function sendQuizQuestion(chatId, questionObj, index) {
  const options = questionObj.options.map((opt, i) => {
    return [{ text: opt, callback_data: `answer_${i}` }];
  });

  const payload = {
    method: "sendMessage",
    chat_id: chatId,
    text: `📚 Q${index + 1}: ${questionObj.question}`,
    reply_markup: {
      inline_keyboard: options
    }
  };

  UrlFetchApp.fetch(`${CONFIG.API_BASE_URL}${CONFIG.BOT_TOKEN}/sendMessage`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}
// ==================== TEST & SETUP FUNCTIONS ====================
function testBotSetup() {
  console.log("🧪 Testing bot configuration...");

  try {
    const sheet = getMessagesSheet();
    console.log(`✅ Messages sheet access: OK - ${sheet.getName()}`);

    const testUrl = `${CONFIG.API_BASE_URL}${CONFIG.BOT_TOKEN}/getMe`;
    const response = UrlFetchApp.fetch(testUrl);
    const result = JSON.parse(response.getContentText());

    if (result.ok) {
      console.log("✅ Telegram API: Connected");
      console.log(`🤖 Bot Info: ${result.result.first_name} (@${result.result.username})`);
    } else {
      console.log("🔴 Telegram API: Failed", result);
    }

    console.log("✅ Bot setup test completed successfully");

  } catch (error) {
    console.error("🔴 Setup test failed:", error.toString());
  }
}

function setWebhook() {
  const webAppUrl = "https://script.google.com/macros/s/AKfycbzAQ0Y0ug-4d6YlpvPOwVqBI0JcTiHEV0PAENEddVaZIEVIuFfcijWkCz_ZB34XPcJO/exec"; // Replace with your actual deployed URL
  const url = `${CONFIG.API_BASE_URL}${CONFIG.BOT_TOKEN}/setWebhook`;

  console.log(`🔗 Setting webhook URL: ${webAppUrl}`);

  const payload = {
    url: webAppUrl,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true
  };

  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseText = response.getContentText();
    const result = JSON.parse(responseText);

    console.log("📡 Webhook setup response:", responseText);

    if (result.ok) {
      console.log("✅ SUCCESS: Webhook set successfully!");
      console.log("🎉 Bot is now ready to receive messages and handle quizzes!");
    } else {
      console.error("🔴 FAILED: Webhook setup failed:", result.description);
    }
  } catch (error) {
    console.error("🔴 Webhook setup failed:", error.toString());
  }
}

function logQuizResult(chatId, subjectId, score, total, percent) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.MESSAGES_SHEET);
  const now = new Date();
  sheet.appendRow(["", "", chatId, "", "", now, subjectId, score, total, percent]);
}
