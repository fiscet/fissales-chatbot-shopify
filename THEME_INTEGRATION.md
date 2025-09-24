# Integrazione Chatbot nel Tema Shopify

Questa guida spiega come integrare il chatbot Fissales nel tema del tuo negozio Shopify.

## Metodo 1: Integrazione con Liquid Template (Raccomandato)

### Per Temi Shopify 2.0

1. **Accedi all'Admin di Shopify**
2. **Vai a Online Store > Themes**
3. **Seleziona il tema che vuoi modificare**
4. **Clicca su "Customize"**
5. **Vai su Theme Settings > Custom Code**
6. **Aggiungi questo codice nell'header:**

```html
<script src="https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app/fissales-chatbot.js"></script>
```

7. **Aggiungi il template Liquid nel footer:**

```liquid
{% render 'embed_chatbot' %}
```

### Per Temi Shopify 1.0 (Liquid)

1. **Accedi all'Admin di Shopify**
2. **Vai a Online Store > Themes**
3. **Clicca su "Actions" > "Edit code"**
4. **Apri il file `theme.liquid`**
5. **Aggiungi questo codice prima della chiusura del tag `</head>`:**

```liquid
<script src="https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app/fissales-chatbot.js"></script>
```

6. **Aggiungi il template Liquid prima della chiusura del tag `</body>`:**

```liquid
{% render 'embed_chatbot' %}
```

7. **Crea il file `snippets/embed_chatbot.liquid` e copia il contenuto da:**
   `https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app/embed_chatbot.liquid`

## Metodo 2: Integrazione Manuale

### Opzione A: Aggiungere al Footer

Aggiungi questo codice prima della chiusura del tag `</body>` nel file `theme.liquid`:

```html
<script src="https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app/fissales-chatbot.js"></script>
```

### Opzione B: Aggiungere all'Header

Aggiungi questo codice nel tag `<head>` del file `theme.liquid`:

```html
<script src="https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app/fissales-chatbot.js"></script>
```

## Personalizzazione

Dopo aver caricato lo script, puoi personalizzare il chatbot:

```javascript
// Configurazione personalizzata
window.FissalesChatbot.config.position = 'bottom-left'; // 'bottom-right' o 'bottom-left'
window.FissalesChatbot.config.theme = 'dark'; // 'light' o 'dark'
window.FissalesChatbot.config.enabled = true; // true o false
window.FissalesChatbot.config.debug = false; // true per debug

// Reinizializza con la nuova configurazione
window.FissalesChatbot.init();
```

## Opzioni di Configurazione

| Opzione | Valori Possibili | Default | Descrizione |
|---------|------------------|---------|-------------|
| `position` | `'bottom-right'`, `'bottom-left'` | `'bottom-right'` | Posizione del widget |
| `theme` | `'light'`, `'dark'` | `'light'` | Tema del widget |
| `enabled` | `true`, `false` | `true` | Abilita/disabilita il chatbot |
| `debug` | `true`, `false` | `false` | Modalità debug |

## Esempi di Integrazione

### Esempio 1: Chatbot Scuro in Basso a Sinistra

```html
<script src="https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app/fissales-chatbot.js"></script>
<script>
  window.FissalesChatbot.config.position = 'bottom-left';
  window.FissalesChatbot.config.theme = 'dark';
  window.FissalesChatbot.init();
</script>
```

### Esempio 2: Chatbot Condizionale (Solo su Pagine Prodotto)

```html
<script src="https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app/fissales-chatbot.js"></script>
<script>
  // Abilita solo su pagine prodotto
  if (window.location.pathname.includes('/products/')) {
    window.FissalesChatbot.config.enabled = true;
    window.FissalesChatbot.init();
  }
</script>
```

### Esempio 3: Chatbot con Configurazione Dinamica

```html
<script src="https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app/fissales-chatbot.js"></script>
<script>
  // Configurazione basata su metafield del tema
  {% if shop.metafields.custom.chatbot_enabled %}
    window.FissalesChatbot.config.enabled = true;
    window.FissalesChatbot.config.position = '{{ shop.metafields.custom.chatbot_position | default: "bottom-right" }}';
    window.FissalesChatbot.config.theme = '{{ shop.metafields.custom.chatbot_theme | default: "light" }}';
    window.FissalesChatbot.init();
  {% endif %}
</script>
```

## Verifica dell'Installazione

1. **Apri il tuo negozio in una nuova scheda**
2. **Controlla che il pulsante del chatbot appaia nell'angolo**
3. **Clicca sul pulsante per aprire il chat**
4. **Prova a inviare un messaggio**

Se il chatbot non appare:

1. **Controlla la console del browser per errori**
2. **Verifica che lo script sia stato caricato correttamente**
3. **Assicurati che l'app sia configurata correttamente nell'admin**

## Risoluzione Problemi

### Il chatbot non appare

- Verifica che lo script sia stato aggiunto correttamente
- Controlla che non ci siano errori JavaScript nella console
- Assicurati che l'app sia installata e configurata

### Il chatbot non risponde

- Verifica che l'API sia configurata correttamente nell'admin
- Controlla che il chatbot sia abilitato nelle impostazioni
- Verifica la connessione di rete

### Errori di CORS

- Lo script gestisce automaticamente le richieste CORS
- Se persistono problemi, contatta il supporto tecnico

## Supporto

Per problemi o domande sull'integrazione:

1. Controlla questa documentazione
2. Verifica la configurazione dell'app nell'admin Shopify
3. Contatta il supporto tecnico Fissales

## Note Importanti

- Il chatbot funziona solo su domini `.myshopify.com` o domini personalizzati configurati correttamente
- È necessario configurare l'API esterna nelle impostazioni dell'app
- Il chatbot deve essere abilitato nelle impostazioni per funzionare
- Lo script è ottimizzato per le performance e non rallenta il caricamento del sito
