from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from utils import sentiment_analysis, mock_data

# Create your views here.


def get_sentiment_metrics(request: HttpRequest, source_id):
    source_id = int(source_id)
    aggregated_sentiment = sentiment_analysis.process_sentiment_records(
        source_id)

    individuals = list(aggregated_sentiment.get("individuals"))

    individuals_data = ""
    for i in individuals:
        individuals_data += f"<p>{ i['data'] }</p>"
        individuals_data += f"<p><b>Positive Ratio: { i['metrics']['positiveRatio'] }</b></p>"
        individuals_data += f"<p><b>Neutral Ratio: { i['metrics']['neutralRatio'] }</b></p>"
        individuals_data += f"<p><b>Negative Ratio: { i['metrics']['negativeRatio'] }</b></p>"
        individuals_data += f"<p><b>Overall Score: { i['metrics']['overallScore'] }</b></p>"
        individuals_data += f"<p><b>Classification: { i['metrics']['classification'] }</b></p>"
        individuals_data += "</br></br>"

    agg_positiveRatio = aggregated_sentiment["positiveRatio"]
    agg_neutralRatio = aggregated_sentiment["neutralRatio"]
    agg_negativeRatio = aggregated_sentiment["negativeRatio"]
    agg_overallScore = aggregated_sentiment["overallScore"]
    agg_classification = aggregated_sentiment["classification"]

    response = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analysis Engine</title>
</head>
<body>
    <h1>Computed Sentiment Metrics</h1>

    <h3>Aggregated Metrics</h3>
    <h6>Positive Ratio : {agg_positiveRatio}</h6>
    <h6>Neutral Ratio : {agg_neutralRatio}</h6>
    <h6>Negative Ratio : {agg_negativeRatio}</h6>
    <h6>Overall Score : {agg_overallScore}</h6>
    <h6>Classification : {agg_classification}</h6>

    <h3>Individual Data and Metrics</h3>
    {individuals_data}
    
</body>
</html>
    """

    return HttpResponse(response)
