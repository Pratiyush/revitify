/** Re-export shim: language detection lives in model/languages (pure data, every layer may
 *  import it — enrich scoring needs it too, and enrich→extract is a forbidden edge). */
export { detectLanguage, EXTENSION_LANGUAGES } from "../model/languages.js";
