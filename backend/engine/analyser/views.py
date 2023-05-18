from django.shortcuts import render
from django.http import JsonResponse
from utils import sentiment_analysis

# Create your views here.


def get_sentiment_metrics(request):
    sentences = [
    "Lived up to the expectations. Grab and run... pleasant and fast service. Definitely a must visit again",

    "Starbucks is good because there is always good coffee, there is Wi-Fi Internet and your name will be loudly called here once. It is right if it is simple and wrong if it is unusual. All of the above is in this Starbucks, which is conveniently located at a significant intersection in Rosebank.",
   
    "I just got looked at when I was at the wrong side of the line (not clear where the right side is) Could not spell my name correctly even though I spelt it out 3 times.",
    
    "Everything is amazing about Starbucks The service is just so good The drinks are the absolute best Keep coming back ⭐️⭐️⭐️⭐️⭐️👍",
    
    "Just bad choice of blend. Poorly made. Really bad texture of frothed milk. Very hyped. Seattle Coffee Co. still the best.",
   
    "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)",
   
    "Coffee is always Good , but unfortunately the food is not up to Starbucks quality Like overseas , the food is premade and delivered , so if you eat a toasted cheese it just get heated up in the microwave",
    
    "We have just moved into Melrose and this Starbucks is our local coffee bar. You can get tickets (if resident) so that everytime you buy a coffee you get the fifth one free. Great staff that get to know your name and what you are drinking.",
    ]
    

    aggregated_sentiment = sentiment_analysis.process_sentiment_records(sentences)
    
    return JsonResponse(aggregated_sentiment)
