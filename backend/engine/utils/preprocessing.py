import nltk
from autocorrect import Speller
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.stem import PorterStemmer
import re


# Removal of whitespace
def remove_whitespace(data: str):
    return " ".join(data.split())


# Remove urls
def remove_urls(text):
    url_pattern = re.compile(r"https?://\S+|www\.\S+")
    return url_pattern.sub(r"", text)


# Word tokenization
def tokenize(data: str):
    # nltk.download("punkt") - uncomment for first execution
    return nltk.word_tokenize(data)


# Spelling Correction
# def correct_spelling(word: str):
#     spell = Speller(lang="en")
#     return spell(word)


# Stopword removal
def remove_stopwords(tokens):
    # nltk.download("stopwords") - uncomment for first execution
    sws = stopwords.words("english")
    new_tokens = []
    for t in tokens:
        if t not in sws:
            new_tokens.append(t)
    return new_tokens


# Lemmatization
def lemmatize_word(word: str):
    # nltk.download("wordnet") - uncomment for first execution
    lemmatizer = WordNetLemmatizer()
    return lemmatizer.lemmatize(word)


def process_data(raw_text: str):
    new_data = remove_whitespace(raw_text)
    new_data = remove_urls(new_data)
    tokens = tokenize(new_data)
    tokens = remove_stopwords(tokens)
    for index, token in enumerate(tokens):
        tokens[index] = lemmatize_word(token)
    return tokens
