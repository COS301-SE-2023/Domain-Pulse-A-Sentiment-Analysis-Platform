from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from analysismodels import sentiment_analysis

# from preprocessor import preprocessing
# from utils import mock_data

# Create your views here.


def get_sentiment_metrics(request: HttpRequest, source_id):
    return JsonResponse(sentiment_analysis.process_sentiment_records(int(source_id)))


#     source_id = int(source_id)
#     aggregated_sentiment = sentiment_analysis.process_sentiment_records(source_id)

#     individuals = list(aggregated_sentiment.get("individuals"))

#     individuals_data = ""
#     for i in individuals:
#         individuals_data += f"<p>{ i['data'] }</p>"
#         individuals_data += (
#             f"<p><b>Positive Ratio: { i['metrics']['positiveRatio'] }</b></p>"
#         )
#         individuals_data += (
#             f"<p><b>Neutral Ratio: { i['metrics']['neutralRatio'] }</b></p>"
#         )
#         individuals_data += (
#             f"<p><b>Negative Ratio: { i['metrics']['negativeRatio'] }</b></p>"
#         )
#         individuals_data += (
#             f"<p><b>Overall Score: { i['metrics']['overallScore'] }</b></p>"
#         )
#         individuals_data += (
#             f"<p><b>Classification: { i['metrics']['classification'] }</b></p>"
#         )
#         individuals_data += "</br></br>"

#     agg_positiveRatio = aggregated_sentiment["positiveRatio"]
#     agg_neutralRatio = aggregated_sentiment["neutralRatio"]
#     agg_negativeRatio = aggregated_sentiment["negativeRatio"]
#     agg_overallScore = aggregated_sentiment["overallScore"]
#     agg_classification = aggregated_sentiment["classification"]

#     response = f"""
# <!DOCTYPE html>
# <html lang="en">
# <head>
#     <meta charset="UTF-8">
#     <meta http-equiv="X-UA-Compatible" content="IE=edge">
#     <meta name="viewport" content="width=device-width, initial-scale=1.0">
#     <title>Analysis Engine</title>
# </head>
# <body>
#     <h1>Computed Sentiment Metrics</h1>

#     <h3>Aggregated Metrics</h3>
#     <h4>Positive Ratio : {agg_positiveRatio}</h4>
#     <h4>Neutral Ratio : {agg_neutralRatio}</h4>
#     <h4>Negative Ratio : {agg_negativeRatio}</h4>
#     <h4>Overall Score : {agg_overallScore}</h4>
#     <h4>Classification : {agg_classification}</h4>

#     <h3>Individual Data and Metrics</h3>
#     {individuals_data}

# </body>
# </html>
#     """

#     return HttpResponse(response)


# def testing_preprocessing(request: HttpRequest):
#     sample_text = "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)"
#     returnData = preprocessing.process_data(sample_text)
#     return JsonResponse({"original": sample_text, "processed": returnData})
