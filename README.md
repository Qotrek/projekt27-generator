# 🏛️ Generator Reform Prawnych - Projekt27.pl

Automatyczny generator kontrowersyjnych reform prawnych w Polsce wykorzystujący Google Gemini AI i integrację z platformą [projekt27.pl](https://projekt27.pl).

## ✨ Funkcje

- 🤖 **Automatyczne generowanie** reform prawnych przez Gemini AI
- 📂 **Inteligentny dobór kategorii** - AI wybiera odpowiednią kategorię spośród 18 dostępnych
- 📝 **Formatowanie Markdown** - treści w czytelnym formacie z nagłówkami i listami
- ⏰ **Harmonogram** - losowy interwał 5-10 minut między publikacjami
- 🧪 **Tryb developerski** - testowanie bez wysyłania requestów
- 🔄 **Ciągła praca** - działa w tle, automatycznie publikuje
- 🔐 **Bezpieczna autentykacja** - tokeny z dynamicznym odnawianiem dostępu

## 📋 Wymagania

- Node.js 18+ (z obsługą ES modules)
- Klucz API Google Gemini ([zdobądź tutaj](https://aistudio.google.com/apikey))
- Konto i token autoryzacyjny z [projekt27.pl](https://projekt27.pl)

## 🚀 Szybki start

1. **Sklonuj repozytorium:**

   ```bash
   git clone https://github.com/qotrek/projekt27-generator.git
   cd projekt27-generator
   ```

2. **Zainstaluj zależności:**

   ```bash
   npm install
   ```

3. **Skonfiguruj zmienne środowiskowe:**

   ```bash
   cp .env.example .env
   ```

4. **Edytuj plik `.env`:**
   - `GEMINI_API_KEY` - Twój klucz API z [Google AI Studio](https://aistudio.google.com/apikey)
   - `PROJECT27_REFRESH_TOKEN` - Refresh token z projekt27.pl (wymagany!)
   - `MIN_INTERVAL_MINUTES` / `MAX_INTERVAL_MINUTES` - odstęp czasu (domyślnie 5-10 min)

   > ℹ️ **Ważne:** Access token jest **pobierany automatycznie** na start aplikacji - nie musisz go wklejać w `.env`!

5. **Uruchom aplikację:**
   ```bash
   npm start
   ```
   Tokeny - Jak to działa

### 📋 Refresh Token (Przechowujesz w `.env`)

- **Czas życia:** długi (tygodnie/miesiące)
- **Cel:** "hasło" do uzyskiwania nowych access tokenów
- **Gdzie:** Wklej wartość `refresh_token` z logowania do `.env`
- **Ryzyko:** Jeśli wycieknie, zmień hasło na projekt27.pl
- **Zmiana:** Praktycznie nigdy się nie zmienia

### 🎫 Access Token (Pobierany dynamicznie)

- **Czas życia:** krótki (kilka godzin)
- **Cel:** Uwierzytelnianie requestów API
- **Pobieranie:** Automatycznie na start aplikacji (`npm start`)
- **Odnawianie:** Gdy wygaśnie (błąd 401) - app sam pobiera nowy
- **Zmiana:** Zmienia się co kilka godzin automatycznie

### 🔄 Jak pobrać tokeny z projekt27.pl

1. Zaloguj się na [projekt27.pl](https://projekt27.pl)
2. Otwórz DevTools (F12)
3. Przejdź do zakładki **Network**
4. Odśwież stronę lub zaloguj się
5. Znajdź request logowania (`/api/auth/login` lub POST)
6. W Response tab będą tokeny:
   ```json
   {
     "access_token": "eyJhbGciOi...",
     "refresh_token": "eyJhbGciOi...",
     "token_type": "bearer"
   }
   ```
7. **Wklej TYLKO refresh token** do `.env`:
   ```env
   PROJECT27_REFRESH_TOKEN=eyJhbGciOi...
   ```

### 🔐 Automatyczne odnawianie dostępu

- Na **start** aplikacji → pobiera świeży access token
- Jeśli access token **wygaśnie** → automatycznie odnawiany
- Refresh token nigdy się nie wysyła w requestach API (tylko do odnawiania)
- **Brak działań** - wszystko działa automagicznie! ✨
  Aplikacja **automatycznie odnawiania** access token gdy wygaśnie (błąd 401). Refresh token jest przechowywany w `.env` i używany do uzyskiwania nowego dostępu bez konieczności ponownego logowania.

## ⚙️ Konfiguracja

### Tryb developerski

W pliku [index.js](index.js) zmień:

```javascript
const DEV_MODE = true; // Symulacja bez wysyłania
const DEV_MODE = false; // Wysyłanie prawdziwych requestów
```

### Interwał czasowy

W pliku `.env`:

```env
MIN_INTERVAL_MINUTES=5   # Minimalny czas oczekiwania
MAX_INTERVAL_MINUTES=10  # Maksymalny czas oczekiwania
```

### Dostępne kategorie

Generator automatycznie wybiera spośród 18 kategorii:

- Deregulacja, Finanse publiczne, Edukacja
- UE i polityka handlowa, Cyfryzacja
- Energetyka, Imigracja, Ochrona zdrowia
- Sprawiedliwość, Infrastruktura i wiele innych...

## 📝 Jak to działa

```mermaid
graph LR
    A[Start] --> B[Gemini API]
    B --> C{Generuje reformę}
    C --> D[Wybiera kategorię]
    D --> E[Format Markdown]
    E --> F{DEV_MODE?}
    F -->|TAK| G[Console.log]
    F -->|NIE| H[POST projekt27.pl]
    H --> I[Czeka 5-10 min]
    I --> B
    G --> I
```

1. **Generowanie:** Gemini AI tworzy kontrowersyjną reformę prawną
2. **Kategoryzacja:** AI wybiera najlepiej pasującą kategorię z 18 dostępnych
3. **Formatowanie:** Treść w Markdown z nagłówkami, listami i formatowaniem
4. **Publikacja:** Wysyłka na projekt27.pl przez API (lub symulacja w trybie dev)
5. **Harmonogram:** Losowe oczekiwanie 5-10 minut i powtórzenie

## 🛠️ Struktura projektu

```
projekt27-generator/
├── index.js           # Główna logika aplikacji
├── list-models.js     # Skrypt do listowania dostępnych modeli Gemini
├── package.json       # Zależności i konfiguracja
├── .env.example       # Przykładowa konfiguracja
├── .env               # Twoja konfiguracja (nie commitowana!)
├── .gitignore         # Ignorowane pliki
└── README.md          # Ta dokumentacja
```

## 🔧 Troubleshooting

### Błąd: "API key not valid"

- Sprawdź czy klucz Gemini API jest poprawny w pliku `.env`
- Upewnij się, że nie ma spacji przed/po kluczu

### Błąd: "models/gemini-xxx is not found"

- Uruchom `node list-models.js` aby zobaczyć dostępne modele
- Zaktualizuj nazwę modelu w [index.js](index.js) linijka 114

### Błąd 401: "Nie udało się zweryfikować danych uwierzytelniających"

- **Normalnie** - aplikacja sama pobiera nowy token (powinno działać automagicznie)
- Jeśli problem się powtarza: **refresh token wygasł lub jest niepoprawny**
- **Rozwiązanie:** Pobierz nowe tokeny (instrukcja w sekcji "🔑 Tokeny")
- Możesz dekodować JWT na [jwt.io](https://jwt.io) aby sprawdzić wygaśnięcie

### Program się zatrzymuje

Użyj PM2 dla produkcji:

```bash
npm install -g pm2
pm2 start index.js --name projekt27-gen
pm2 logs projekt27-gen
pm2 restart projekt27-gen
```

## 🚦 Uruchamianie w tle

### Linux/Mac

```bash
nohup npm start > output.log 2>&1 &
```

### Windows (PowerShell)

```powershell
Start-Process -NoNewWindow node index.js
```

### Docker (opcjonalnie)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

```bash
docker build -t projekt27-gen .
docker run -d --env-file .env projekt27-gen
```

## 📊 Przykładowy output

```
🚀 Uruchamiam generator reform prawnych...
⚙️  Interwał: 5-10 minut

🤖 Generuję nową reformę prawną...
📂 Kategoria: Finanse publiczne
✅ Wygenerowano reformę: Podatek Patriotyczny Plus
📤 Wysyłam reformę na projekt27.pl...
✅ Pomyślnie wysłano reformę! Status: 201
🎉 Cykl zakończony sukcesem!

⏰ Następne uruchomienie za 7 minut (14:32:15)
```

## ⚠️ Disclaimer

Ten projekt:

- Generuje **satyryczne/parodystyczne** treści przy użyciu AI
- Służy do celów **edukacyjnych i badawczych**
- **Nie reprezentuje** poglądów autora
- Użytkownik ponosi **pełną odpowiedzialność** za wygenerowane i opublikowane treści

## 🤝 Współpraca

Pull requesty są mile widziane! W przypadku większych zmian, otwórz najpierw issue.

## 📄 Licencja

[MIT](LICENSE)

## 🔗 Linki

- [Projekt27.pl](https://projekt27.pl)
- [Google Gemini AI](https://ai.google.dev/)
- [Google AI Studio - Klucze API](https://aistudio.google.com/apikey)

---

Stworzone z 🤖 przez AI | Powered by Google Gemini
