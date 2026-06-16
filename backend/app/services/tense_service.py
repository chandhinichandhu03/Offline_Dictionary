import re

# Tense detection patterns (ordered from most specific to least)
TENSE_RULES = [
    # Future Perfect Continuous: will have been + Ving
    {
        "tense": "Future Perfect Continuous",
        "patterns": [
            r'\b(will|shall)\s+have\s+been\s+\w+ing\b',
        ],
    },
    # Future Perfect: will have + past participle
    {
        "tense": "Future Perfect",
        "patterns": [
            r'\b(will|shall)\s+have\s+\w+(ed|en|t)\b',
            r'\b(will|shall)\s+have\s+(been|gone|done|seen|made|come|taken|given)\b',
        ],
    },
    # Future Continuous: will be + Ving
    {
        "tense": "Future Continuous",
        "patterns": [
            r'\b(will|shall)\s+be\s+\w+ing\b',
        ],
    },
    # Simple Future: will + base verb
    {
        "tense": "Simple Future",
        "patterns": [
            r'\b(will|shall)\s+\w+\b',
            r'\b(going\s+to)\s+\w+\b',
        ],
    },
    # Past Perfect Continuous: had been + Ving
    {
        "tense": "Past Perfect Continuous",
        "patterns": [
            r'\bhad\s+been\s+\w+ing\b',
        ],
    },
    # Past Perfect: had + past participle
    {
        "tense": "Past Perfect",
        "patterns": [
            r'\bhad\s+\w+(ed|en|t)\b',
            r'\bhad\s+(been|gone|done|seen|made|come|taken|given|already)\b',
            r'\bhad\s+never\s+\w+\b',
        ],
    },
    # Present Perfect Continuous: has/have been + Ving
    {
        "tense": "Present Perfect Continuous",
        "patterns": [
            r'\b(has|have)\s+been\s+\w+ing\b',
        ],
    },
    # Present Perfect: has/have + past participle
    {
        "tense": "Present Perfect",
        "patterns": [
            r'\b(has|have)\s+\w+(ed|en|t)\b',
            r'\b(has|have)\s+(been|gone|done|seen|made|come|taken|given|already)\b',
            r'\b(has|have)\s+never\s+\w+\b',
        ],
    },
    # Past Continuous: was/were + Ving
    {
        "tense": "Past Continuous",
        "patterns": [
            r'\b(was|were)\s+\w+ing\b',
        ],
    },
    # Simple Past: verb+ed or irregular past
    {
        "tense": "Simple Past",
        "patterns": [
            r'\b(was|were)\b',
            r'\b\w+ed\b',
            r'\b(went|came|saw|did|had|got|made|took|gave|said|told|found|knew|thought|bought|brought|caught|taught|felt|left|lost|met|paid|put|read|ran|sat|sent|set|spent|stood|understood|won|wrote|ate|began|broke|chose|drove|fell|flew|forgot|grew|hid|kept|led|meant|rose|sang|spoke|stole|swam|threw|wore|woke)\b',
        ],
    },
    # Present Continuous: am/is/are + Ving
    {
        "tense": "Present Continuous",
        "patterns": [
            r'\b(am|is|are)\s+\w+ing\b',
        ],
    },
    # Simple Present (default)
    {
        "tense": "Simple Present",
        "patterns": [
            r'.*',
        ],
    },
]


def detect_tense(sentence: str) -> dict:
    """Detect the tense of a given sentence using rule-based patterns."""
    sentence_lower = sentence.lower().strip()

    for rule in TENSE_RULES:
        for pattern in rule["patterns"]:
            if re.search(pattern, sentence_lower):
                # Don't match the default Simple Present catch-all unless nothing else matched
                if rule["tense"] == "Simple Present" and pattern == r'.*':
                    continue
                return {
                    "tense": rule["tense"],
                    "confidence": "high" if rule["tense"] != "Simple Present" else "medium",
                    "matched_pattern": pattern,
                }

    return {
        "tense": "Simple Present",
        "confidence": "low",
        "matched_pattern": "default",
    }


def get_tense_explanation(tense: str) -> str:
    """Get a brief explanation of the detected tense."""
    explanations = {
        "Simple Present": "Used for habits, general truths, and repeated actions.",
        "Present Continuous": "Used for actions happening right now or around the present time.",
        "Present Perfect": "Used for actions that happened at an unspecified time before now or that started in the past and continue to the present.",
        "Present Perfect Continuous": "Used for actions that started in the past and continue to the present, emphasizing duration.",
        "Simple Past": "Used for actions that were completed at a definite time in the past.",
        "Past Continuous": "Used for actions that were in progress at a specific time in the past.",
        "Past Perfect": "Used for actions completed before another past action.",
        "Past Perfect Continuous": "Used for actions that were ongoing before another past action, emphasizing duration.",
        "Simple Future": "Used for predictions, promises, or decisions made at the moment of speaking.",
        "Future Continuous": "Used for actions that will be in progress at a specific time in the future.",
        "Future Perfect": "Used for actions that will be completed before a specific time in the future.",
        "Future Perfect Continuous": "Used for actions that will have been ongoing up to a specific future time, emphasizing duration.",
    }
    return explanations.get(tense, "No explanation available.")
