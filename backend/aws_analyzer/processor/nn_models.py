# VADER scores
# Not a neural network, but is a model used for sentiment analysis so it is grouped with the others for the sake of consistency
ANALYSER = None

# DistilBERT neural network models below

# To classify emotion
EMOTION_CLASSIFIER = None

# For toxicity
TOXIC_CLASSIFIER = None

# General positive or negative
GENERAL_CLASSIFIER = None

def downloadModels():
    from transformers import pipeline
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

    # Downloading VADER model
    print("Downloading VADER model")
    SentimentIntensityAnalyzer()

    # Downloading DistilBERT models
    print("Downloading DistilBERT models")
    emotian_model = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        # return_all_scores=True, deprecated, instead se below
        top_k=None,
    )
    emotian_model.save_pretrained("/usr/share/transformers/emotion_classifier")

    pipe = pipeline("text-classification", model="martin-ha/toxic-comment-model")
    pipe.save_pretrained("/usr/share/transformers/toxic_classifier")

    pipe = pipeline(
        "text-classification", model="distilbert-base-uncased-finetuned-sst-2-english"
    )
    pipe.save_pretrained("/usr/share/transformers/general_classifier")

    print("Finished downloading models")

def initializeModels():
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    from transformers import pipeline
    ANALYSER = SentimentIntensityAnalyzer()

    # DistilBERT neural network models below

    # To classify emotion
    EMOTION_CLASSIFIER = pipeline(
        "text-classification",
        model="/usr/share/transformers/emotion_classifier",
        # return_all_scores=True, deprecated, instead se below
        top_k=None,
    )

    # For toxicity
    TOXIC_CLASSIFIER = pipeline(
        "text-classification", model="/usr/share/transformers/toxic_classifier"
    )

    # General positive or negative
    GENERAL_CLASSIFIER = pipeline(
        "text-classification", model="/usr/share/transformers/general_classifier"
    )

    return ANALYSER, EMOTION_CLASSIFIER, TOXIC_CLASSIFIER, GENERAL_CLASSIFIER

if __name__ == "__main__":
    #this file should be run as main before importing into other files
    downloadModels()