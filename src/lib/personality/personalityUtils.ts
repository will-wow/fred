const nlp = require("nlp_compromise");
import _ = require('lodash');

interface ConjugateVerbOptions {
  negate?: boolean;
  contraction?: boolean;
}

/**
 * Conjugates a verb, based on the preceding noun.
 * @param noun - The noun
 * @param verb - The verb
 * @param negate - If true, negate the verb (has => hasn't)
 * @param options.negate - If true, negate the verb (does => doesn't)
 * @param options.contraction - If set to false, don't return a contraction. Otherwise do.
 * @returns The conjugated verb.
 */
export function conjugateVerb(noun: string, verb: string, options?: ConjugateVerbOptions): string {
  options = options || {};

  const {negate, contraction} = options;


  const conjugatedVerb = _.includes(['i', 'we', 'you'], noun.toLowerCase()) ?
    nlp.verb(verb).conjugate().infinitive :
    nlp.verb(verb).conjugate().present;

  if (!negate) {
    return conjugatedVerb;
  }

  const negatedVerb = nlp.verb(conjugatedVerb).negate().text;

  // The default is to use contractions, unles false is specified.
  if (contraction !== false) {
    return negatedVerb;
  }

  // Expand the contraction.
  const nlpVerbText = nlp.text(negatedVerb);
  nlpVerbText.contractions.expand();
  return nlpVerbText.text();
}

/**
 * Return a singular or plural word, depending on the length.
 * @param word
 * @param length
 * @returns The word
 */
export function pluralize(word: string, length: number): string {
  return length === 1 ? nlp.noun(word).singularize() : nlp.noun(word).pluralize();
}

/**
 * Returns 'you' if there is no user, otherwise the username.
 * Optionally conjugates a verb to go with the username.
 * @param user - the username, or undefined
 * @param verb - the verb to conjugate.
 * @param options - Options
 * @returns The user name and verb
 */
export function userOrYou(user: string, verb?: string, options?: ConjugateVerbOptions) {
  user = user || 'you';

  if (verb) {
    return `${user} ${conjugateVerb(user, verb, options)}`;
  } else {
    return user;
  }
}

/**
 * Handle a possesive for a user or 'you'
 * @param user - the username, or undefined
 * @returns <user>'s or 'your'
 */
export function usersOrYour(user?: string) {
  return user ? `${user}'s` : 'your';
}
