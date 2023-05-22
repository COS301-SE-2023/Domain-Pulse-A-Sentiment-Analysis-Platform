from django.test import TestCase

# Create your tests here.
from django.test import TestCase, Client
from django.urls import reverse
from utils import sentiment_analysis

class SentimentAnalysisTests(TestCase):
    def test_classification(self):
        score1 = -0.8
        score2 = -0.5
        score3 = -0.15
        score4 = 0.09
        score5 = 0.18
        score6 = 0.7
        score7 = 0.9

        assert sentiment_analysis.score_to_classification(score1) == "VERY_NEGATIVE"
        assert sentiment_analysis.score_to_classification(score2) == "NEGATIVE"
        assert sentiment_analysis.score_to_classification(score3) == "SOMEWHAT_NEGATIVE"
        assert sentiment_analysis.score_to_classification(score4) == "NEUTRAL"
        assert sentiment_analysis.score_to_classification(score5) == "SOMEWHAT_POSTIVE"
        assert sentiment_analysis.score_to_classification(score6) == "POSITIVE"
        assert sentiment_analysis.score_to_classification(score7) == "VERY_POSTIVE"

    def test_analyse_content(self):
        sentence = "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)"
        result = sentiment_analysis.analyse_content(sentence)

        data = result["data"]
        metrics = result["metrics"]

        assert data == sentence
        assert 1 >= metrics["positiveRatio"] >= 0
        assert 1 >= metrics["neutralRatio"] >= 0
        assert 1 >= metrics["negativeRatio"] >= 0
        assert 1 >= metrics["overallScore"] >= 0 # has a positive score
        assert "POSTIVE" in str(metrics["classification"])

    def test_aggregate_sentiment_data(self):
        sentence1 = "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)"
        sentence2 ="I had an amazing valentines, it was my first time at Starbucks and every one was so nice and the service was amazing. They even allow pets at the outside setting, I love it"
        sentence3 ="The best Starbucks in South Africa. Great for getting some work done and they have an expert barista in Bibo! He’s an absolute wizard who’s super knowledgeable, ask for him by name!"
        sentence4 ="The Starbucks layout is lovely and cozy, it makes you want to just sit and enjoy. The baristas are also so great and kind and full of positive energy :)"
        sentence5 ="Doesn't have a Starbucks vibe at all. It's dirty and not very well maintained. I didn't get a receipt and when I asked for it they had excuses etc. To be honest, it's the worst Starbucks I've ever been to."
        dataList = [sentiment_analysis.analyse_content(sentence1), sentiment_analysis.analyse_content(sentence2),sentiment_analysis.analyse_content(sentence3),sentiment_analysis.analyse_content(sentence4),sentiment_analysis.analyse_content(sentence5)]
        result=sentiment_analysis.aggregate_sentiment_data(dataList)
        sentiments = ["VERY_NEGATIVE","NEGATIVE","SOMEWHAT_NEGATIVE","NEUTRAL","SOMEWHAT_POSTIVE","POSITIVE","VERY_POSTIVE"]

        assert 1 >= result["positiveRatio"] >= 0
        assert 1 >= result["neutralRatio"] >= 0
        assert 1 >= result["negativeRatio"] >= 0
        assert 1 >= result["overallScore"] >= 0 # has a positive score
        assert result["classification"] in sentiments
        assert list(result["individuals"]) == dataList

    def test_process_sentiment_records(self):
        result=sentiment_analysis.process_sentiment_records(1)

        assert 1 >= result["positiveRatio"] >= 0
        assert 1 >= result["neutralRatio"] >= 0
        assert 1 >= result["negativeRatio"] >= 0
        assert 1 >= result["overallScore"] >= 0 # has a positive score
        assert result["classification"] in sentiments
        assert list(result["individuals"]) == dataList
    