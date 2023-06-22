from django.test import TestCase
import mock

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

    def test_summarize_general(self):
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

    def test_summarize_vader(self):
        test = {"pos": 0.1, "neu": 0.7, "neg": 0.2}
        result = processing.summarize_vader(test)
        assert (
            result["positive"] == test["pos"]
            and result["negative"] == test["neg"]
            and result["neutral"] == test["neu"]
        )

    @mock.patch("processor.processing.have_better", side_effect=mocked_have_better)
    @mock.patch("processor.processing.replace_worst", side_effect=mocked_replace_worst)
    def test_summarize_emotions(self, mocked1, mocked2):
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

    def test_summarize_toxicity(self):
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
    def test_analyse_content(self, mock1, mock2, mock3, mock4, mock5):
        data = "This is some test data!"

        result = processing.analyse_content(data)

        assert result["data"] == data
        assert result["general"] == {}
        assert result["emotions"] == {}
        assert result["toxicity"] == {}
        assert result["ratios"] == {}

    # ----------------------------------------------------------------
