from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

ANALYSER = SentimentIntensityAnalyzer()


def score_to_classification(score):
    overall_sentiment = ""
    if -1 <= score <= -0.75:
        overall_sentiment = "VERY_NEGATIVE"
    elif -0.75 < score <= -0.25:
        overall_sentiment = "NEGATIVE"
    elif -0.25 < score <= -0.1:
        overall_sentiment = "SOMEWHAT_NEGATIVE"
    elif -0.1 < score < 0.1:
        overall_sentiment = "NEUTRAL"
    elif 0.1 <= score < 0.25:
        overall_sentiment = "SOMEWHAT_POSTIVE"
    elif 0.25 <= score < 0.75:
        overall_sentiment = "POSTIVE"
    elif 0.75 <= score <= 1:
        overall_sentiment = "VERY_POSTIVE"
    return overall_sentiment


def analyse_content(sentence):
    results = ANALYSER.polarity_scores(sentence)
    negative = results['neg']
    neutral = results['neu']
    positive = results['pos']
    compound = results['compound']

    sentimentData = {
        "positiveRatio": positive,
        "neutralRatio": neutral,
        "negativeRatio": negative,
        "overallScore": compound,
        "classification": score_to_classification(compound)
    }

    return sentimentData


def aggregate_sentiment_data(sentiment_data):
    sentiment_data = list(sentiment_data)

    summedNegRatio = 0
    summedNeuRatio = 0
    summedPosRatio = 0
    summedCompound = 0

    for entry in sentiment_data:
        summedNegRatio += entry["negativeRatio"]
        summedNeuRatio += entry["neutralRatio"]
        summedPosRatio += entry["positiveRatio"]
        summedCompound += entry["overallScore"]

    num = len(sentiment_data)

    aggregated_data = {
        "positiveRatio": summedPosRatio/num,
        "neutralRatio": summedNeuRatio/num,
        "negativeRatio": summedNegRatio/num,
        "overallScore": summedCompound/num,
        "classification": score_to_classification(summedCompound/num)
    }

    return aggregated_data


def process_sentiment_records(sentences):
    sentences = list(sentences)
    scores = []
    for sentence in sentences:
        scores.append(analyse_content(sentence))
    return aggregate_sentiment_data(scores)
