import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

dotenv.config();

const DEV_MODE = false;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PROJECT27_TOKEN = process.env.PROJECT27_TOKEN;
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
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

const categoriesList = CATEGORIES.map(
  (c) => `- ${c.name}: ${c.description}`,
).join('\n');

const PROMPT = `Wygeneruj kontrowersyjną, skrajnie prawicową i dziwną reformę prawa w Polsce.
Może być bazowana na obecnych trendach politycznych i społecznych w Polsce.

DOSTĘPNE KATEGORIE:
${categoriesList}

Wygeneruj w formacie JSON z polami:
- title: chwytliwy tytuł reformy - MAKSYMALNIE 100 znaków, najlepiej 60-90
- summary: zwięzłe podsumowanie - TUTAJ NIE MOŻESZ UŻYWAĆ MARKDOWNA - MAKSYMALNIE 300 znaków, najlepiej 200-280
- content: szczegółowy opis reformy w formacie MARKDOWN - MAKSYMALNIE 7000 znaków. Użyj nagłówków (##, ###), list (-, *), pogrubienia (**tekst**). Podziel na sekcje: Uzasadnienie, Cele, Wdrożenie, Skutki społeczne, Skutki ekonomiczne.
- category: nazwa kategorii z listy powyżej (DOKŁADNIE jak podano, np. "Finanse publiczne", "Imigracja")

!!!ABSOLUTNIE KRYTYCZNE - NIE PRZEKRACZAJ TYCH LIMITÓW!!!:
- title: MAKSYMALNIE 100 znaków (NIE WIĘCEJ!)
- summary: MAKSYMALNIE 300 znaków (NIE WIĘCEJ!)
- content: MAKSYMALNIE 7000 znaków (NIE WIĘCEJ!)

Jeśli przekroczysz limity, request się nie powiedzie!
Bądź kreatywny i kontrowersyjny ale TRZYMAJ SIĘ LIMITÓW!
Odpowiedz TYLKO w formacie JSON, bez żadnych dodatkowych komentarzy.`;

async function generateReform() {
  try {
    console.log('🤖 Generuję nową reformę prawną...');

    const result = await model.generateContent(PROMPT);
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

    jsonText = jsonText
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/\r\n/g, '\\n')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');

    const reform = JSON.parse(jsonText);

    console.log(
      `📏 Długości: title=${reform.title?.length}, summary=${reform.summary?.length}, content=${reform.content?.length}`,
    );

    const category = CATEGORIES.find((c) => c.name === reform.category);
    if (!category) {
      console.warn(
        `⚠️  Nieznana kategoria: "${reform.category}", używam domyślnej`,
      );
      reform.category_id = CATEGORIES[0].id;
    } else {
      reform.category_id = category.id;
      console.log(`📂 Kategoria: ${category.name}`);
    }

    console.log('✅ Wygenerowano reformę:', reform.title);
    return reform;
  } catch (error) {
    console.error('❌ Błąd podczas generowania reformy:', error.message);
    throw error;
  }
}

async function postReform(reform) {
  try {
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
  try {
    const reform = await generateReform();
    await postReform(reform);
    console.log('🎉 Cykl zakończony sukcesem!\n');
  } catch (error) {
    console.error('💥 Cykl zakończony błędem:', error.message, '\n');
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

// Start aplikacji
console.log('🚀 Uruchamiam generator reform prawnych...');
console.log(`⚙️  Interwał: ${MIN_INTERVAL}-${MAX_INTERVAL} minut\n`);

// Pierwsze uruchomienie od razu
runCycle().then(() => {
  scheduleNext();
});
