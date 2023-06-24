import json

# Opening JSON file
gc1 = open("goddesscafe1.json")
gc3 = open("goddesscafe3.json")
hcc1 = open("hccinsta1.json")
sharks1 = open("sharksinsta1.json")
tuks1 = open("tuks1.json")

# returns JSON object as
# a dictionary

full_data = [gc1, gc3, hcc1, sharks1, tuks1]
db = {}
currIndex = 0

for index, file in enumerate(full_data):
    data = json.load(file)
    print(file)

    arr = data["metrics"]

    for item in arr:
        id = str(index) + str(currIndex)
        currIndex += 1

        item["source_id"] = index

        db[str(id)] = item

        with open("temp" + str(id) + ".json", "w") as outfile:
            json.dump(item, outfile)

    file.close()
