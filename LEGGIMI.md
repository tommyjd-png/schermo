# Schermo — simulazione schermata di blocco (iPhone 15 Pro, iOS 26)

## Cosa fa
1. Mostra la tua schermata di blocco con ora e data vere.
2. Swipe verso l'alto: compare il tastierino (Dynamic Island con lucchetto e Face ID).
3. Primo e secondo codice: i pallini tremano e si svuotano.
4. Terzo codice: il lucchetto si apre e compare la tua Home.

Le cifre digitate non vengono mai lette: ogni tasto aumenta soltanto un contatore di pallini.
La pagina ha una regola di sicurezza che blocca qualsiasi connessione di rete. Niente salvataggi, niente appunti, niente schermate nascoste.

## Comandi segreti
- **4 o 6 cifre**: sulla schermata di blocco tieni premuto l'orologio per circa mezzo secondo.
  Metà sinistra ("22") = 4 cifre. Metà destra ("50") = 6 cifre.
  Conferma discreta: la lineetta in alto a destra lampeggia 1 volta (4) o 2 volte (6).
- **Ricominciare dopo lo sblocco**: nella Home tieni premuto "Cerca" per 1 secondo.
  L'app riparte comunque dalla schermata di blocco ogni volta che la chiudi e la riapri.

## Pubblicare su GitHub Pages (una volta sola)
1. Crea un account gratuito su github.com.
2. In alto a destra: **+ → New repository**. Nome, per esempio: `schermo`. Seleziona **Public**. Premi **Create repository**.
3. Nella pagina del repository premi **uploading an existing file**.
4. Decomprimi lo zip sul computer, apri la cartella `schermo` e trascina **tutto il suo contenuto** (non la cartella stessa) nella pagina. Premi **Commit changes**.
5. Vai su **Settings → Pages**. In "Branch" scegli **main** e **/ (root)**, poi **Save**.
6. Dopo 1–2 minuti in cima alla pagina compare l'indirizzo, del tipo `https://tuonome.github.io/schermo/`.

Attenzione: con un repository pubblico, chiunque abbia l'indirizzo può vedere la pagina e le immagini (sfondo, Home con i promemoria). La pagina non è indicizzata dai motori di ricerca, ma l'indirizzo non va diffuso.

## Installare sull'iPhone
1. Apri l'indirizzo con **Safari** (non con altre app).
2. Tocca **Condividi → Aggiungi alla schermata Home**. Lascia attivo **Apri come app Web**. Rinomina se vuoi e tocca **Aggiungi**.
3. Apri l'app dall'icona sulla Home: solo così si apre a schermo intero.
4. Aprila una volta con la connessione attiva: da quel momento funziona anche offline.

## Modificare qualcosa
- Da GitHub apri il file (per esempio `config.js`), premi la matita, modifica e **Commit changes**.
- Poi apri `sw.js` e cambia `schermo-v1` in `schermo-v2` (v3, v4… a ogni modifica). Senza questo passaggio l'iPhone può continuare a mostrare la versione vecchia.
- Chiudi del tutto l'app (swipe dal multitasking) e riaprila due volte.

## Modalità confronto (per rifinire l'orologio)
Apri in Safari l'indirizzo con `?confronto` in fondo, per esempio `https://tuonome.github.io/schermo/?confronto`.
Appare lo screenshot originale semitrasparente sopra la simulazione. Il pulsante "Riferimento" alterna 0/50/100%.
Con gli slider allinei l'orologio. Poi copia i numeri mostrati in `config.js` alla voce `orologio`.
In Safari la pagina è rimpicciolita per via delle barre del browser: il confronto resta valido perché si rimpicciolisce tutto insieme.
