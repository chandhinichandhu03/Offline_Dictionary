import re
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.grammar_dataset import GrammarDataset
from app.models.word import Word


# Suffix-to-POS mapping rules
SUFFIX_POS_RULES = {
    # Noun suffixes
    "ness": "noun", "ment": "noun", "tion": "noun", "sion": "noun",
    "ity": "noun", "ence": "noun", "ance": "noun", "dom": "noun",
    "ship": "noun", "hood": "noun", "ism": "noun", "ist": "noun",
    "er": "noun", "or": "noun", "age": "noun",
    # Adjective suffixes
    "ful": "adjective", "less": "adjective", "ous": "adjective",
    "ive": "adjective", "able": "adjective", "ible": "adjective",
    "al": "adjective", "ial": "adjective", "ic": "adjective",
    "ical": "adjective", "ish": "adjective",
    # Adverb suffixes
    "ly": "adverb",
    # Verb suffixes
    "ize": "verb", "ise": "verb", "ify": "verb", "ate": "verb",
    "ing": "verb", "ed": "verb",
}

# Tense form detection patterns
TENSE_PATTERNS = {
    "ing": "Present Participle",
    "ed": "Past Tense",
    "en": "Past Participle",
    "s": "Third Person Singular",
    "es": "Third Person Singular",
}


def analyze_word_grammar(db: Session, word: str) -> dict:
    """Analyze the grammar of a single word."""
    word_lower = word.lower().strip()

    # First try database lookup (GrammarDataset)
    grammar_entry = (
        db.query(GrammarDataset)
        .filter(GrammarDataset.word == word_lower)
        .first()
    )

    if grammar_entry:
        return {
            "word": word,
            "pos": grammar_entry.pos.capitalize(),
            "tense_form": grammar_entry.tense_form,
            "description": grammar_entry.description,
            "source": "dataset",
        }

    # Second try dictionary database (Word model pos field)
    dict_word = (
        db.query(Word)
        .filter(func.lower(Word.word) == word_lower)
        .first()
    )
    if dict_word and dict_word.pos:
        tense_form = _detect_tense_form(word_lower)
        return {
            "word": word,
            "pos": dict_word.pos.capitalize(),
            "tense_form": tense_form,
            "description": f"The word '{word}' is found in the local lexical database as a {dict_word.pos.lower()}.",
            "source": "lexical-db",
        }

    # Third try WordNet lookup
    try:
        from nltk.corpus import wordnet
        synsets = wordnet.synsets(word_lower)
        if synsets:
            wn_pos = synsets[0].pos()
            pos_map = {'n': 'noun', 'v': 'verb', 'a': 'adjective', 's': 'adjective', 'r': 'adverb'}
            pos = pos_map.get(wn_pos, 'unknown')
            
            tense_form = _detect_tense_form(word_lower)
            return {
                "word": word,
                "pos": pos.capitalize(),
                "tense_form": tense_form,
                "description": f"The word '{word}' is found in the offline WordNet corpus as a {pos}.",
                "source": "wordnet",
            }
    except Exception as e:
        print(f"[WordNet] Error during analyze_word_grammar lookup for '{word_lower}': {e}")

    # Fall back to rule-based analysis
    pos = _detect_pos_by_suffix(word_lower)
    tense_form = _detect_tense_form(word_lower)

    return {
        "word": word,
        "pos": pos.capitalize() if pos else "Unknown",
        "tense_form": tense_form,
        "description": f"The word '{word}' appears to be a {pos}" if pos else f"Could not determine POS for '{word}'",
        "source": "rule-based",
    }


def _detect_pos_by_suffix(word: str) -> str:
    """Detect POS based on word suffix."""
    # Check longer suffixes first for better accuracy
    sorted_suffixes = sorted(SUFFIX_POS_RULES.keys(), key=len, reverse=True)
    for suffix in sorted_suffixes:
        if word.endswith(suffix) and len(word) > len(suffix):
            return SUFFIX_POS_RULES[suffix]
    return "unknown"


def _detect_tense_form(word: str) -> str:
    """Detect the tense form of a word."""
    if word.endswith("ing"):
        return "Present Participle"
    elif word.endswith("ed"):
        return "Past Tense / Past Participle"
    elif word.endswith("en") and len(word) > 3:
        return "Past Participle"
    elif word.endswith("s") and not word.endswith("ss"):
        return "Third Person Singular / Plural"
    return "Base Form"


def analyze_sentence_grammar(sentence: str) -> dict:
    """Perform basic grammar analysis on a sentence."""
    words = re.findall(r'\b\w+\b', sentence)
    if not words:
        return {"error": "No words found in sentence"}

    # Simple SVO detection
    subject = None
    verb = None
    obj = None

    # Common subject pronouns
    subject_pronouns = {"i", "you", "he", "she", "it", "we", "they"}
    # Common auxiliary verbs
    auxiliaries = {"is", "am", "are", "was", "were", "has", "have", "had",
                   "will", "shall", "would", "should", "could", "can", "may",
                   "might", "do", "does", "did", "being", "been"}
    # Common articles/determiners
    determiners = {"the", "a", "an", "this", "that", "these", "those", "my",
                   "your", "his", "her", "its", "our", "their"}

    words_lower = [w.lower() for w in words]

    # Find subject (first noun phrase)
    i = 0
    subject_parts = []
    while i < len(words_lower):
        if words_lower[i] in subject_pronouns:
            subject_parts.append(words[i])
            i += 1
            break
        elif words_lower[i] in determiners:
            subject_parts.append(words[i])
            i += 1
            # Next word(s) are likely the subject noun
            while i < len(words_lower) and words_lower[i] not in auxiliaries and not words_lower[i].endswith("ing") and not words_lower[i].endswith("ed") and words_lower[i] not in {"is", "am", "are", "was", "were"}:
                subject_parts.append(words[i])
                i += 1
                break
            break
        else:
            subject_parts.append(words[i])
            i += 1
            break

    subject = " ".join(subject_parts) if subject_parts else words[0] if words else None

    # Find verb (first verb-like word after subject)
    verb_parts = []
    auxiliary_parts = []
    main_verb = None
    while i < len(words_lower):
        if words_lower[i] in auxiliaries or words_lower[i].endswith("ing") or words_lower[i].endswith("ed") or words_lower[i].endswith("s"):
            if words_lower[i] in auxiliaries:
                auxiliary_parts.append(words[i])
            else:
                main_verb = words[i]
            verb_parts.append(words[i])
            i += 1
            # Check for main verb after auxiliary
            if verb_parts and words_lower[i - 1] in auxiliaries and i < len(words_lower):
                if words_lower[i] in auxiliaries:
                    auxiliary_parts.append(words[i])
                else:
                    main_verb = words[i]
                verb_parts.append(words[i])
                i += 1
            break
        else:
            # Assume it's a verb anyway
            main_verb = words[i]
            verb_parts.append(words[i])
            i += 1
            break

    verb = " ".join(verb_parts) if verb_parts else None
    auxiliary = " ".join(auxiliary_parts) if auxiliary_parts else None

    # Remaining words are object
    obj_parts = words[i:]
    # Remove trailing punctuation
    if obj_parts:
        obj_parts[-1] = re.sub(r'[^\w\s]', '', obj_parts[-1])
    obj = " ".join(obj_parts) if obj_parts else None

    return {
        "subject": subject,
        "verb": verb,
        "object": obj if obj and obj.strip() else None,
        "auxiliary": auxiliary,
        "main_verb": main_verb,
        "word_count": len(words),
    }
