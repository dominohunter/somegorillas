import { useState } from "react";

const GorilakLanguage = () => {
  const [englishText, setEnglishText] = useState("");
  const [gorilakText, setGorilakText] = useState("");
  const [isEnglishToGorilak, setIsEnglishToGorilak] = useState(true);

  // Gorilak alphabet mapping
  const gorilakAlphabet: { [key: string]: string } = {
    a: "ng",
    b: "bl",
    c: "gb",
    d: "dk",
    e: "fp",
    f: "ht",
    g: "jx",
    h: "kr",
    i: "lm",
    j: "mg",
    k: "nx",
    l: "pr",
    m: "qs",
    n: "rm",
    o: "sx",
    p: "ty",
    q: "qu",
    r: "vw",
    s: "sy",
    t: "tp",
    u: "ul",
    v: "vk",
    w: "wh",
    x: "xs",
    y: "yu",
    z: "zl",
  };

  // Reverse mapping for translation back
  const englishAlphabet: { [key: string]: string } = {};
  Object.keys(gorilakAlphabet).forEach((key) => {
    englishAlphabet[gorilakAlphabet[key]] = key;
  });

  // Common words dictionary
  const commonWords: { [key: string]: string } = {
    the: "tp",
    and: "ngrmdk",
    i: "ng",
    you: "yxul",
    is: "syy",
    are: "ngvwfp",
    gorilla: "jxkrvrrmng",
    banana: "blngrmngrmng",
    eat: "fpngtp",
    good: "jxkxdk",
    yes: "yfsyy",
    no: "rmkxs",
    hello: "krlmsx",
    friend: "hvwfprmdk",
  };

  const commonWordsReverse: { [key: string]: string } = {};
  Object.keys(commonWords).forEach((key) => {
    commonWordsReverse[commonWords[key]] = key;
  });

  const translateToGorilak = (text: string): string => {
    const words = text.toLowerCase().split(/\s+/);
    let result = "";

    for (const word of words) {
      if (word === "") continue;

      if (commonWords[word]) {
        result += commonWords[word] + " ";
        continue;
      }

      const punctuation = word.match(/[.,!?;:]$/);
      const cleanWord = word.replace(/[.,!?;:]$/, "");

      let translatedWord = "";
      for (const char of cleanWord) {
        if (gorilakAlphabet[char]) {
          translatedWord += gorilakAlphabet[char];
        }
      }

      result += translatedWord;
      if (punctuation) result += punctuation[0];
      result += " ";
    }

    return result.trim();
  };

  const translateToEnglish = (text: string): string => {
    const words = text.toLowerCase().split(/\s+/);
    let result = "";

    for (const word of words) {
      if (word === "") continue;

      if (commonWordsReverse[word]) {
        result += commonWordsReverse[word] + " ";
        continue;
      }

      const punctuation = word.match(/[.,!?;:]$/);
      const cleanWord = word.replace(/[.,!?;:]$/, "");

      let translatedWord = "";
      let i = 0;
      while (i < cleanWord.length) {
        if (i < cleanWord.length - 1) {
          const twoChar = cleanWord.substring(i, i + 2);
          if (englishAlphabet[twoChar]) {
            translatedWord += englishAlphabet[twoChar];
            i += 2;
            continue;
          }
        }

        const oneChar = cleanWord[i];
        if (englishAlphabet[oneChar]) {
          translatedWord += englishAlphabet[oneChar];
        } else {
          translatedWord += oneChar;
        }
        i++;
      }

      result += translatedWord;
      if (punctuation) result += punctuation[0];
      result += " ";
    }

    return result.trim();
  };

  const handleTranslate = () => {
    if (isEnglishToGorilak) {
      setGorilakText(translateToGorilak(englishText));
    } else {
      setEnglishText(translateToEnglish(gorilakText));
    }
  };

  const handleSwap = () => {
    setIsEnglishToGorilak(!isEnglishToGorilak);
    const tempText = englishText;
    setEnglishText(gorilakText);
    setGorilakText(tempText);
  };

  const clearAll = () => {
    setEnglishText("");
    setGorilakText("");
  };

  // Sample alphabet letters for display
  const sampleLetters = [
    { english: "A", gorilak: "ng", sound: "grunt" },
    { english: "B", gorilak: "bl", sound: "belch" },
    { english: "C", gorilak: "gb", sound: "chest beat" },
    { english: "D", gorilak: "dk", sound: "bark" },
    { english: "E", gorilak: "fp", sound: "hum" },
    { english: "F", gorilak: "ht", sound: "hoot" },
  ];

  return (
    <div className="backdrop-blur-[48px] rounded-[24px] p-6 flex flex-col gap-y-5 bg-translucent-dark-12 border-2 border-translucent-light-8 max-w-[640px]">
      {/* Header */}
      <div className="flex flex-col outline-2 outline-translucent-light-8 rounded-2xl">
        <div className="py-4 flex items-start px-6 rounded-2xl outline-2 outline-translucent-light-8] bg-translucent-light-8">
          <p className="text-light-primary text-h5 font-semibold">
            🦍 Learn Gorilak - The Gorilla Language
          </p>
        </div>
        <div className="py-4 px-6 flex items-start">
          <p className="text-light-primary text-body-1 font-pally">
            Communicate like a true gorilla! Based on real gorilla vocalizations
            including grunts, belches, and chest beats.
          </p>
        </div>
      </div>

      {/* Translator */}
      <div className="flex flex-col outline-2 outline-translucent-light-8 rounded-2xl">
        <div className="py-4 flex items-start px-6 rounded-2xl outline-2 outline-translucent-light-8] bg-translucent-light-8">
          <p className="text-light-primary text-h5 font-semibold">Translator</p>
        </div>
        <div className="py-4 px-6 flex flex-col gap-4">
          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-light-primary text-sm font-semibold">
                {isEnglishToGorilak ? "English" : "Gorilak"}
              </label>
              <textarea
                value={isEnglishToGorilak ? englishText : gorilakText}
                onChange={(e) =>
                  isEnglishToGorilak
                    ? setEnglishText(e.target.value)
                    : setGorilakText(e.target.value)
                }
                placeholder={
                  isEnglishToGorilak
                    ? "Type English text..."
                    : "Type Gorilak text..."
                }
                className="w-full h-24 p-3 rounded-lg bg-translucent-light-8 border border-translucent-light-16 text-light-primary text-sm font-mono resize-none focus:outline-none focus:border-[#F5D020]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-light-primary text-sm font-semibold">
                {isEnglishToGorilak ? "Gorilak" : "English"}
              </label>
              <textarea
                value={isEnglishToGorilak ? gorilakText : englishText}
                onChange={(e) =>
                  isEnglishToGorilak
                    ? setGorilakText(e.target.value)
                    : setEnglishText(e.target.value)
                }
                placeholder={
                  isEnglishToGorilak
                    ? "Gorilak translation..."
                    : "English translation..."
                }
                className="w-full h-24 p-3 rounded-lg bg-translucent-light-8 border border-translucent-light-16 text-light-primary text-sm font-mono resize-none focus:outline-none focus:border-[#F5D020]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={handleTranslate}
              className="px-4 py-2 bg-[#F5D020] text-dark-primary rounded-lg font-semibold hover:bg-[#E6C01D] transition-colors"
            >
              Translate
            </button>
            <button
              onClick={handleSwap}
              className="px-4 py-2 bg-translucent-light-8 text-light-primary rounded-lg font-semibold hover:bg-translucent-light-16 transition-colors border border-translucent-light-16"
            >
              ⇄ Swap
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-translucent-light-8 text-light-primary rounded-lg font-semibold hover:bg-translucent-light-16 transition-colors border border-translucent-light-16"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Sample Alphabet */}
      <div className="flex flex-col outline-2 outline-translucent-light-8 rounded-2xl">
        <div className="py-4 flex items-start px-6 rounded-2xl outline-2 outline-translucent-light-8] bg-translucent-light-8">
          <p className="text-light-primary text-h5 font-semibold">
            Sample Letters
          </p>
        </div>
        <div className="py-4 px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sampleLetters.map((letter, index) => (
              <div
                key={index}
                className="bg-translucent-light-8 border border-translucent-light-16 rounded-lg p-3 text-center"
              >
                <div className="text-[#F5D020] text-lg font-bold font-mono">
                  {letter.gorilak}
                </div>
                <div className="text-light-primary text-sm font-semibold">
                  {letter.english}
                </div>
                <div className="text-translucent-light-64 text-xs italic">
                  {letter.sound}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="flex flex-col outline-2 outline-translucent-light-8 rounded-2xl">
        <div className="py-4 flex items-start px-6 rounded-2xl outline-2 outline-translucent-light-8] bg-translucent-light-8">
          <p className="text-light-primary text-h5 font-semibold">
            Example Phrases
          </p>
        </div>
        <div className="py-4 px-6 flex flex-col gap-3">
          <div className="bg-translucent-light-8 rounded-lg p-3">
            <div className="text-[#F5D020] font-bold font-mono">
              ng fp blngrmngrmng
            </div>
            <div className="text-light-primary text-sm">I eat banana</div>
          </div>
          <div className="bg-translucent-light-8 rounded-lg p-3">
            <div className="text-[#F5D020] font-bold font-mono">
              krlmsx hvwfprmdk
            </div>
            <div className="text-light-primary text-sm">Hello friend</div>
          </div>
          <div className="bg-translucent-light-8 rounded-lg p-3">
            <div className="text-[#F5D020] font-bold font-mono">
              jxkrvrrmng jxkxdk
            </div>
            <div className="text-light-primary text-sm">Gorilla good</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GorilakLanguage;
