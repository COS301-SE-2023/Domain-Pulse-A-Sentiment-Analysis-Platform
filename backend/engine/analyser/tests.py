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
