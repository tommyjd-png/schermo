/*
  IMPOSTAZIONI
  Puoi modificare i numeri qui sotto direttamente da GitHub (icona della matita).
  Dopo ogni modifica, cambia anche il numero di versione in sw.js (vedi LEGGIMI).
*/
window.CONFIG = {

  // Quante cifre mostra il tastierino all'apertura: 4 oppure 6.
  // Durante il numero lo cambi di nascosto:
  //   - tocco sull'icona della fotocamera = alterna 4 ↔ 6 cifre
  //   - oppure pressione lunga sull'orologio: metà sinistra = 4, metà destra = 6.
  // Conferma: la lineetta in alto a destra lampeggia 1 volta (4) o 2 volte (6).
  cifreIniziali: 4,

  // Quanti tentativi falliscono prima dello sblocco (2 = si sblocca al terzo).
  tentativiFalliti: 2,

  // Durata della pressione prolungata sull'orologio, in millisecondi.
  pressioneLunga: 650,

  // Ore con lo zero davanti (09:05) oppure senza (9:05).
  zeroIniziale: false,

  // La data nel widget Calendario della Home segue il giorno reale.
  dataDinamicaHome: true,

  // Vibrazione sperimentale al codice sbagliato (trucco non ufficiale di Safari: può non funzionare).
  vibrazione: true,

  // Distanza tra i pallini (in punti) per 4 e 6 cifre.
  spaziaturaPallini: { 4: 37, 6: 26.5 },

  // Orologio della schermata di blocco. Si regola comodamente con la modalità confronto.
  orologio: {
    dimensione: 122.7,  // grandezza del carattere
    peso: 660,          // spessore (400 normale, 700 grassetto)
    larghezza: 302,     // larghezza totale di "22:50" in punti
    altezza: 1,         // allungamento verticale (1 = nessuno)
    baseline: 200.8     // posizione verticale della base delle cifre
  },

  // Data sopra l'orologio.
  data: { dimensione: 22.3, peso: 600, larghezza: 104, baseline: 100 }
};
