import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

dotenv.config();

const DEV_MODE = false;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let PROJECT27_TOKEN = null;
const PROJECT27_REFRESH_TOKEN = process.env.PROJECT27_REFRESH_TOKEN;
const MIN_INTERVAL = parseInt(process.env.MIN_INTERVAL_MINUTES) || 5;
const MAX_INTERVAL = parseInt(process.env.MAX_INTERVAL_MINUTES) || 10;
const API_ENDPOINT = 'https://projekt27.pl/api/ideas';

const CATEGORIES = [
  {
    id: '0cff54e0-8ab3-4e96-90a6-dfbdcbd4d56a',
    name: 'Deregulacja',
    description: 'Uproszczenie przepisów, zmniejszenie biurokracji',
  },
  {
    id: '60c4555a-dc64-4b64-8250-ddac8c54c6b1',
    name: 'UE i polityka handlowa',
    description: 'Relacje z Unią Europejską, umowy handlowe, polityka celna',
  },
  {
    id: 'b604db4f-ec8b-4bd3-a3a3-0402b7e45f06',
    name: 'Finanse publiczne',
    description: 'Budżet państwa, podatki, polityka fiskalna',
  },
  {
    id: '1c397838-9a7e-4dda-a9f7-83b7f48454ad',
    name: 'Edukacja',
    description: 'System edukacji, szkolnictwo podstawowe i średnie',
  },
  {
    id: '5ac89864-e360-4145-97df-8690527bd35b',
    name: 'Cyfryzacja i nowoczesne technologie',
    description: 'Transformacja cyfrowa państwa i gospodarki',
  },
  {
    id: '4b90799e-9d06-4c51-861b-2e0022ded3d9',
    name: 'Wybory i partie polityczne',
    description: 'System wyborczy, finansowanie partii, ordynacja',
  },
  {
    id: '5cc226e9-432c-485c-9c9c-0fcd0fb80471',
    name: 'Samorządy',
    description: 'Samorząd terytorialny, decentralizacja, kompetencje lokalne',
  },
  {
    id: '70567a4d-89a6-4473-af26-1b132e099df9',
    name: 'Infrastruktura i budownictwo',
    description: 'Drogi, koleje, budownictwo mieszkaniowe, transport',
  },
  {
    id: '3d9fc112-651f-4d25-a5b5-e7ba5b6f1f26',
    name: 'Energetyka',
    description: 'Polityka energetyczna, OZE, bezpieczeństwo energetyczne',
  },
  {
    id: '39163841-2a27-4bc4-824b-17e41e7dbc99',
    name: 'Środowisko',
    description: 'Ochrona środowiska, klimat, gospodarka odpadami',
  },
  {
    id: 'f8f40de8-a07b-4859-aaba-c1b181dc44f1',
    name: 'Imigracja',
    description: 'Polityka migracyjna, integracja, rynek pracy',
  },
  {
    id: '912f7f7b-85ac-44e7-9308-b3a36bb7584f',
    name: 'Wolność osobista',
    description: 'Prawa obywatelskie, wolność słowa, prywatność',
  },
  {
    id: '3d276263-e706-4fe1-a01e-68cd1a531d1c',
    name: 'Aktywa państwowe',
    description: 'Spółki Skarbu Państwa, prywatyzacja, zarządzanie majątkiem',
  },
  {
    id: '3706f4b4-5581-4d3c-81bc-277c500ebd6f',
    name: 'Kultura i media',
    description: 'Polityka kulturalna, media publiczne, wolność mediów',
  },
  {
    id: '06715ea5-4829-4d32-9d87-13dc0e0f3db5',
    name: 'Sprawiedliwość',
    description: 'Wymiar sprawiedliwości, sądy, prokuratura',
  },
  {
    id: 'db3539f0-a027-4718-8ce8-5c65b030e155',
    name: 'Prawo pracy i ubezpieczeń społecznych',
    description: 'Kodeks pracy, ZUS, emerytury, rynek pracy',
  },
  {
    id: 'e180f958-96e0-4f50-85f2-4d52d8343f33',
    name: 'Rolnictwo',
    description: 'Polityka rolna, dopłaty, rozwój wsi',
  },
  {
    id: 'b939b1bd-cd5c-4f8b-9358-b299688e2a4f',
    name: 'Ochrona zdrowia',
    description: 'System ochrony zdrowia, NFZ, szpitale, profilaktyka',
  },
];

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 1.5,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 16384,
  },
});

const categoriesList = CATEGORIES.map(
  (c) => `- ${c.name}: ${c.description}`,
).join('\n');

const PROMPT = `Wygeneruj propozycję reformy prawa w Polsce, która jest innowacyjna i odważna, ale jednocześnie realistyczna do wdrożenia.
Reforma powinna odnosić się do rzeczywistych problemów Polski, być kontrowersyjna na tyle by wzbudzała dyskusję, ale nie na tyle by była kompletnie nierealna.
Inspiruj się obecnymi trendami politycznymi i społecznymi, ale utrzymuj propozycje w granicach rozsądku.

!!!ABSOLUTNIE KRYTYCZNE - KATEGORIA!!!
MUSISZ wybrać DOKŁADNIE JEDNĄ kategorię z poniższej listy. Użyj DOKŁADNIE takiej samej nazwy jak podano:

DOSTĘPNE KATEGORIE (wybierz JEDNĄ):
${categoriesList}

Przykłady POPRAWNYCH nazw kategorii:
- "Finanse publiczne"
- "Imigracja"
- "Ochrona zdrowia"
- "Edukacja"

UWAGA: Jeśli nie podasz kategorii lub użyjesz niewłaściwej nazwy, twoja odpowiedź zostanie ODRZUCONA!

Wygeneruj w formacie JSON z polami:
- title: chwytliwy, ale profesjonalny tytuł reformy - MAKSYMALNIE 100 znaków
- summary: zwięzłe, merytoryczne podsumowanie - TUTAJ NIE MOŻESZ UŻYWAĆ MARKDOWNA - MAKSYMALNIE 300 znaków
- content: szczegółowy opis reformy w formacie MARKDOWN - MAKSYMALNIE 4500 znaków. Użyj nagłówków (##, ###), list (-, *), pogrubienia (**tekst**). Podziel na sekcje: Uzasadnienie, Cele, Wdrożenie, Skutki społeczne, Skutki ekonomiczne. BĄDŹ ZWIĘZŁY!
- category: DOKŁADNA nazwa kategorii z listy powyżej (OBOWIĄZKOWE!)

PRZYKŁAD STRUKTURY JSON:
{
  "title": "Tytuł reformy",
  "summary": "Krótkie podsumowanie",
  "content": "## Uzasadnienie\\n\\nTreść...\\n\\n## Cele\\n\\n- Cel 1\\n- Cel 2",
  "category": "Finanse publiczne"
}

!!!KRYTYCZNE - ZASADY JSON!!!
- Generuj PRAWIDŁOWY, KOMPLETNY JSON - używaj \\n dla nowych linii w treści content
- Wszystkie znaki specjalne w stringach muszą być POPRAWNIE escapowane (\\n, \\t, \\", \\\\)
- Nie używaj ŻADNYCH znaków kontrolnych w treści
- JSON musi być parsewalny przez JSON.parse()
- ZAKOŃCZ WSZYSTKIE STRINGI znakiem " i ZAMKNIJ obiekt JSON za pomocą }
- Pole "category" MUSI istnieć i MUSI zawierać DOKŁADNĄ nazwę z listy kategorii!

!!!ABSOLUTNIE KRYTYCZNE - NIE PRZEKRACZAJ TYCH LIMITÓW!!!
- title: MAKSYMALNIE 100 znaków
- summary: MAKSYMALNIE 300 znaków
- content: MAKSYMALNIE 4500 znaków - BĄDŹ ZWIĘZŁY ALE MERYTORYCZNY!

Jeśli przekroczysz limity lub nie podasz poprawnej kategorii, request się nie powiedzie!
Bądź innowacyjny i kontrowersyjny, ale zachowaj realizm i merytorykę. TRZYMAJ SIĘ LIMITÓW!
Odpowiedz TYLKO w formacie JSON, bez żadnych dodatkowych komentarzy.`;

async function generateReform() {
  try {
    console.log('🤖 Generuję nową reformę prawną...');

    const randomSeed = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();
    const uniquePrompt = `${PROMPT}\n\n[Generacja ID: ${randomSeed} | Czas: ${timestamp}]`;

    const result = await model.generateContent(uniquePrompt);
    const response = result.response;
    const text = response.text();

    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }

    let reform;
    try {
      reform = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ Błąd parsowania JSON:', parseError.message);
      const errorPos = parseInt(parseError.message.match(/\d+/)?.[0] || '0');
      console.error(
        '🔍 Fragment:',
        jsonText.substring(Math.max(0, errorPos - 100), errorPos + 100),
      );
      console.log('\n📄 Pełny JSON do debugowania:');
      console.log(jsonText);
      throw parseError;
    }

    console.log(
      `📏 Długości: title=${reform.title?.length}, summary=${reform.summary?.length}, content=${reform.content?.length}`,
    );

    if (!reform.category || typeof reform.category !== 'string') {
      throw new Error(
        `Brak lub niepoprawna kategoria: "${reform.category}" - wymagane ponowne generowanie`,
      );
    }

    const category = CATEGORIES.find((c) => c.name === reform.category);
    if (!category) {
      throw new Error(
        `Nieznana kategoria: "${reform.category}" - wymagane ponowne generowanie`,
      );
    }

    reform.category_id = category.id;
    console.log(`📂 Kategoria: ${category.name}`);
    console.log('✅ Wygenerowano reformę:', reform.title);
    return reform;
  } catch (error) {
    console.error('❌ Błąd podczas generowania reformy:', error.message);
    throw error;
  }
}

async function refreshAccessToken() {
  try {
    console.log('🔄 Pobieranie nowego access token...');

    const response = await axios.post('https://projekt27.pl/api/auth/refresh', {
      refresh_token: PROJECT27_REFRESH_TOKEN,
    });

    PROJECT27_TOKEN = response.data.access_token;

    console.log('✅ Access token pobrany pomyślnie');
    return PROJECT27_TOKEN;
  } catch (error) {
    console.error(
      '❌ Błąd pobierania tokena:',
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function postReform(reform) {
  try {
    // Pobierz świeży token przed każdym wysłaniem
    await refreshAccessToken();

    const body = {
      title: reform.title,
      summary: reform.summary,
      content: reform.content,
      category_id: reform.category_id,
    };

    const headers = {
      Authorization: `Bearer ${PROJECT27_TOKEN}`,
      'Content-Type': 'application/json',
    };

    if (DEV_MODE) {
      console.log('🧪 [DEV MODE] Request który zostałby wysłany:\n');
      console.log('📍 URL:', API_ENDPOINT);
      console.log('\n📋 Headers:');
      console.log(JSON.stringify(headers, null, 2));
      console.log('\n📦 Body:');
      console.log(JSON.stringify(body, null, 2));
      console.log('\n✅ [DEV MODE] Symulacja zakończona pomyślnie\n');
      return { dev_mode: true, simulated: true };
    }

    console.log('📤 Wysyłam reformę na projekt27.pl...');

    const response = await axios.post(API_ENDPOINT, body, { headers });
    console.log('✅ Pomyślnie wysłano reformę! Status:', response.status);
    return response.data;
  } catch (error) {
    console.error(
      '❌ Błąd podczas wysyłania reformy:',
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function runCycle() {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      if (attempt > 1) {
        console.log(`🔄 Próba ${attempt}/${MAX_RETRIES}...`);
      }

      const reform = await generateReform();
      await postReform(reform);
      console.log('🎉 Cykl zakończony sukcesem!\n');
      return;
    } catch (error) {
      if (error.message.includes('wymagane ponowne generowanie')) {
        console.warn(
          `⚠️  ${error.message} - ponawiam próbę (${attempt}/${MAX_RETRIES})...\n`,
        );
        if (attempt >= MAX_RETRIES) {
          console.error(
            `💥 Przekroczono limit prób (${MAX_RETRIES}). Cykl zakończony błędem.\n`,
          );
        }
      } else {
        console.error('💥 Cykl zakończony błędem:', error.message, '\n');
        return;
      }
    }
  }
}

function getRandomInterval() {
  const minutes =
    Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) +
    MIN_INTERVAL;
  return minutes * 60 * 1000;
}

function scheduleNext() {
  const interval = getRandomInterval();
  const nextRunTime = new Date(Date.now() + interval);
  console.log(
    `⏰ Następne uruchomienie za ${interval / 60000} minut (${nextRunTime.toLocaleTimeString('pl-PL')})\n`,
  );

  setTimeout(async () => {
    await runCycle();
    scheduleNext();
  }, interval);
}

console.log('🚀 Uruchamiam generator reform prawnych...');
console.log(`⚙️  Interwał: ${MIN_INTERVAL}-${MAX_INTERVAL} minut\n`);

runCycle().then(() => {
  scheduleNext();
});
