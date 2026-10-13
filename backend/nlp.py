from collections import Counter
from functools import lru_cache
import string

from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import PunktSentenceTokenizer, TreebankWordTokenizer
import spacy


@lru_cache(maxsize=1)
def _load_nlp():
    return spacy.load("en_core_web_sm")


@lru_cache(maxsize=1)
def _load_sentiment():
    return SentimentIntensityAnalyzer()


def analyze_text(text):
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Transcript text is required.")

    nlp = _load_nlp()
    word_tokenizer = TreebankWordTokenizer()
    sentence_tokenizer = PunktSentenceTokenizer()
    tokens = word_tokenizer.tokenize(text)
    words = [token.strip(string.punctuation) for token in tokens]
    words = [token for token in words if token and any(character.isalnum() for character in token)]
    sentences = [sentence for sentence in sentence_tokenizer.tokenize(text) if sentence.strip()]

    frequencies = Counter(
        token.lower()
        for token in words
        if len(token) >= 3
        and token.lower() not in nlp.Defaults.stop_words
        and not token.isnumeric()
    )
    keywords = [
        {"text": word, "count": count}
        for word, count in sorted(frequencies.items(), key=lambda entry: (-entry[1], entry[0]))[:10]
    ]

    doc = nlp(text[:100_000])
    named_entities = [
        {"text": entity.text, "type": entity.label_}
        for entity in doc.ents[:30]
    ]

    scores = _load_sentiment().polarity_scores(text[:100_000])
    sentiment = {
        "label": (
            "positive" if scores["compound"] >= 0.05
            else "negative" if scores["compound"] <= -0.05
            else "neutral"
        ),
        "positive": round(scores["pos"] * 100),
        "neutral": round(scores["neu"] * 100),
        "negative": round(scores["neg"] * 100),
    }

    return {
        "word_count": len(words),
        "sentence_count": len(sentences),
        "character_count": len(text),
        "keywords": keywords,
        "named_entities": named_entities,
        "sentiment": sentiment,
    }
