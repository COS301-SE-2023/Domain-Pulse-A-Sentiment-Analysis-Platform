from django.test import TestCase
from utils import mock_data
import mock
from django.http import JsonResponse, HttpRequest, HttpResponse

# Create your tests here.
from django.test import TestCase, Client
from django.urls import reverse
from preprocessor import preprocessing
from processor import processing


def mocked_have_better(dummy, dummy2):
    return True


def mocked_replace_worst(input, dummy, dummy2):
    return input


def mocked_process_data(dummy):
    return dummy


def mocked_summarize_vader(dummy):
    return {}


def mocked_summarize_general(dummy):
    return {}


def mocked_summarize_emotions(dummy):
    return {}


def mocked_summarize_toxicity(dummy):
    return {}


class SentimentAnalysisTests(TestCase):
    # -------------------------- UNIT TESTS --------------------------

    def test_summarize_general_unit(self):
        gen_metrics1 = [{"label": "POSITIVE", "score": 0.11117471}]
        gen_metrics2 = [{"label": "POSITIVE", "score": 0.6666246266}]
        gen_metrics3 = [{"label": "POSITIVE", "score": 0.88882464288}]
        gen_metrics4 = [{"label": "NEGATIVE", "score": 0.111246111}]
        gen_metrics5 = [{"label": "NEGATIVE", "score": 0.66624624666}]
        gen_metrics6 = [{"label": "NEGATIVE", "score": 0.888824688}]

        assert (
            processing.summarize_general(gen_metrics1)["category"]
            == "SOMEWHAT_POSITIVE"
        )
        assert processing.summarize_general(gen_metrics2)["category"] == "POSITIVE"
        assert processing.summarize_general(gen_metrics3)["category"] == "VERY_POSITIVE"

        assert (
            0
            < processing.summarize_general(gen_metrics1)["score"]
            < processing.summarize_general(gen_metrics2)["score"]
            < processing.summarize_general(gen_metrics3)["score"]
            < 1
        )

        assert (
            processing.summarize_general(gen_metrics4)["category"]
            == "SOMEWHAT_NEGATIVE"
        )
        assert processing.summarize_general(gen_metrics5)["category"] == "NEGATIVE"
        assert processing.summarize_general(gen_metrics6)["category"] == "VERY_NEGATIVE"

        assert (
            1
            > processing.summarize_general(gen_metrics4)["score"]
            > processing.summarize_general(gen_metrics5)["score"]
            > processing.summarize_general(gen_metrics6)["score"]
            > 0
        )

        assert (
            processing.summarize_general(gen_metrics3)["score"]
            > processing.summarize_general(gen_metrics4)["score"]
        )

    def test_summarize_vader_unit(self):
        test = {"pos": 0.1, "neu": 0.7, "neg": 0.2}
        result = processing.summarize_vader(test)
        assert (
            result["positive"] == test["pos"]
            and result["negative"] == test["neg"]
            and result["neutral"] == test["neu"]
        )

    @mock.patch("processor.processing.have_better", side_effect=mocked_have_better)
    @mock.patch("processor.processing.replace_worst", side_effect=mocked_replace_worst)
    def test_summarize_emotions_unit(self, mocked1, mocked2):
        emotions = [
            [
                {"label": "anger", "score": 0.004419783595949411},
                {"label": "disgust", "score": 0.0016119900392368436},
                {"label": "fear", "score": 0.0004138521908316761},
                {"label": "joy", "score": 0.9771687984466553},
                {"label": "neutral", "score": 0.005764586851000786},
                {"label": "sadness", "score": 0.002092392183840275},
                {"label": "surprise", "score": 0.008528684265911579},
            ]
        ]

        result = processing.summarize_emotions(emotions)
        assert result["anger"] + result["disgust"] + result["fear"] == 1

    def test_summarize_toxicity_unit(self):
        toxicity_non = [{"label": "non-toxic", "score": 0.946453869342804}]

        toxicity_neu = [{"label": "toxic", "score": 0.009464538693428}]

        toxicity_tox = [{"label": "toxic", "score": 0.946453869342804}]

        result1 = processing.summarize_toxicity(toxicity_non)
        result2 = processing.summarize_toxicity(toxicity_neu)
        result3 = processing.summarize_toxicity(toxicity_tox)

        assert result1["level_of_toxic"] == "Non-toxic"
        assert result2["level_of_toxic"] == "Neutral"
        assert result3["level_of_toxic"] == "Toxic"

        assert result1["score"] < result2["score"] < result3["score"]

    @mock.patch(
        "processor.processing.summarize_vader", side_effect=mocked_summarize_vader
    )
    @mock.patch(
        "processor.processing.summarize_general", side_effect=mocked_summarize_general
    )
    @mock.patch(
        "processor.processing.summarize_emotions", side_effect=mocked_summarize_emotions
    )
    @mock.patch(
        "processor.processing.summarize_toxicity", side_effect=mocked_summarize_toxicity
    )
    @mock.patch(
        "preprocessor.preprocessing.process_data", side_effect=mocked_process_data
    )
    def test_analyse_content_unit(self, mock1, mock2, mock3, mock4, mock5):
        data = "This is some test data!"

        result = processing.analyse_content(data)

        assert result["data"] == data
        assert result["general"] == {}
        assert result["emotions"] == {}
        assert result["toxicity"] == {}
        assert result["ratios"] == {}

    def test_lemmatize_word(self):
        test_cases = [
            ("kites", "kite"),
            ("babies", "baby"),
            ("dogs", "dog"),
            ("flying", "flying"),
        ]

        for word, lemma in test_cases:
            assert preprocessing.lemmatize_word(word) == lemma

    def test_remove_whitespace(self):
        test_case = "hello the    e  dnm 1       mkmff"

        assert preprocessing.remove_whitespace(test_case) == "hello the e dnm 1 mkmff"

    def test_remove_newlines(self):
        test_case = """hi there\nthis is a\nlong test\nbro\n\n\n"""

        assert (
            preprocessing.remove_newlines(test_case)
            == "hi there this is a long test bro   "
        )

    def test_remove_urls(self):
        test_case = """https://docs.google.com/document/u/0/ hi there https://clickup.up.ac.za/ultra/stream this is a long https://github.com/ test bro"""

        assert (
            preprocessing.remove_urls(test_case)
            == " hi there  this is a long  test bro"
        )

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------

    def test_analyse_content_integration(self):
        data = "This is some test data!"

        result = processing.analyse_content(data)

        assert result["data"] == data
        assert result["general"] != {}
        assert result["emotions"] != {}
        assert result["toxicity"] != {}
        assert result["ratios"] != {}

    def test_perform_analysis_integration(self):
        request_body = {
            "data": [
                "Lived up to the expectations. Grab and run... pleasant and fast service. Definitely a must visit again",
                "Starbucks is good because there is always good coffee, there is Wi-Fi Internet and your name will be loudly called here once. It is right if it is simple and wrong if it is unusual. All of the above is in this Starbucks, which is conveniently located at a significant intersection in Rosebank.",
                "I just got looked at when I was at the wrong side of the line (not clear where the right side is) Could not spell my name correctly even though I spelt it out 3 times.",
                "Everything is amazing about Starbucks The service is just so good The drinks are the absolute best Keep coming back ⭐️⭐️⭐️⭐️⭐️👍",
                "Just bad choice of blend. Poorly made. Really bad texture of frothed milk. Very hyped. Seattle Coffee Co. still the best.",
                "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)",
                "Coffee is always Good , but unfortunately the food is not up to Starbucks quality Like overseas , the food is premade and delivered , so if you eat a toasted cheese it just get heated up in the microwave",
                "We have just moved into Melrose and this Starbucks is our local coffee bar. You can get tickets (if resident) so that everytime you buy a coffee you get the fifth one free. Great staff that get to know your name and what you are drinking.",
            ]
        }

        response: JsonResponse = self.client.post(
            path="/analyser/compute/",
            data=request_body,
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)

        expected_data = {
            "metrics": [
                {
                    "data": "Lived up to the expectations. Grab and run... pleasant and fast service. Definitely a must visit again",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9998},
                    "emotions": {"surprise": 0.016, "sadness": 0.0073, "joy": 0.9767},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.25, "neutral": 0.75, "negative": 0.0},
                },
                {
                    "data": "Starbucks is good because there is always good coffee, there is Wi-Fi Internet and your name will be loudly called here once. It is right if it is simple and wrong if it is unusual. All of the above is in this Starbucks, which is conveniently located at a significant intersection in Rosebank.",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9897},
                    "emotions": {"anger": 0.139, "surprise": 0.5295, "joy": 0.3314},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.117, "neutral": 0.835, "negative": 0.048},
                },
                {
                    "data": "I just got looked at when I was at the wrong side of the line (not clear where the right side is) Could not spell my name correctly even though I spelt it out 3 times.",
                    "general": {"category": "VERY_NEGATIVE", "score": 0.0002},
                    "emotions": {
                        "surprise": 0.5791,
                        "disgust": 0.0491,
                        "sadness": 0.3718,
                    },
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.0, "neutral": 0.875, "negative": 0.125},
                },
                {
                    "data": "Everything is amazing about Starbucks The service is just so good The drinks are the absolute best Keep coming back ⭐️⭐️⭐️⭐️⭐️👍",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9999},
                    "emotions": {"anger": 0.0084, "joy": 0.9343, "surprise": 0.0573},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0006},
                    "ratios": {"positive": 0.329, "neutral": 0.671, "negative": 0.0},
                },
                {
                    "data": "Just bad choice of blend. Poorly made. Really bad texture of frothed milk. Very hyped. Seattle Coffee Co. still the best.",
                    "general": {"category": "VERY_NEGATIVE", "score": 0.0049},
                    "emotions": {
                        "surprise": 0.0749,
                        "disgust": 0.2795,
                        "sadness": 0.6456,
                    },
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0008},
                    "ratios": {"positive": 0.122, "neutral": 0.667, "negative": 0.211},
                },
                {
                    "data": "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9999},
                    "emotions": {"surprise": 0.0402, "joy": 0.9401, "sadness": 0.0197},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0006},
                    "ratios": {"positive": 0.335, "neutral": 0.665, "negative": 0.0},
                },
                {
                    "data": "Coffee is always Good , but unfortunately the food is not up to Starbucks quality Like overseas , the food is premade and delivered , so if you eat a toasted cheese it just get heated up in the microwave",
                    "general": {"category": "POSITIVE", "score": 0.7908},
                    "emotions": {"joy": 0.0183, "sadness": 0.8799, "surprise": 0.1018},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0006},
                    "ratios": {"positive": 0.115, "neutral": 0.817, "negative": 0.068},
                },
                {
                    "data": "We have just moved into Melrose and this Starbucks is our local coffee bar. You can get tickets (if resident) so that everytime you buy a coffee you get the fifth one free. Great staff that get to know your name and what you are drinking.",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9861},
                    "emotions": {"anger": 0.0271, "surprise": 0.2946, "joy": 0.6783},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0011},
                    "ratios": {"positive": 0.131, "neutral": 0.869, "negative": 0.0},
                },
            ]
        }

        self.assertEqual(response.json(), expected_data)

    # ----------------------------------------------------------------
