import csv
import time

from flask import Flask, jsonify, request

app = Flask(__name__)
url_timestamp = {}
url_timestamp2 = {}
url_viewtime = {}
url_viewtime_stripped = {}  # Dictionary using stripped URLs
prev_url = ""
prev_url2 = ""

dataset = {}
with open('Python files\website_classification_data.csv', mode='r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        dataset[row['Website']] = row['Category']

def url_strip(url):
    if "http://" in url or "https://" in url:
        url = url.replace("https://", '').replace("http://", '').replace('\"', '').replace("www.", '').replace(".com", '').replace(".in", '').replace(".gov", '').replace(".net", '').replace(".org", '').replace(".edu", '')
    if "/" in url:
        url = url.split('/', 1)[0]
    return url.capitalize()

def url_strip2(url):
    if "http://" in url or "https://" in url:
        url = url.replace("https://", '').replace("http://", '').replace('\"', '').replace("www.", '')
    if "/" in url:
        url = url.split('/', 1)[0]
    return url  # Return the modified URL

# Initialize category_total_time outside of the send_url function
category_total_time = {}

@app.route('/send_url', methods=['POST'])
def send_url():
    global category_total_time  # Make sure to declare category_total_time as global
    resp_json = request.get_data()
    params = resp_json.decode()
    original_url = params.replace("url=", "")  # Storing the original URL
    stripped_url = url_strip(original_url)  # Stripping the URL
    stripped_url2 = url_strip2(original_url)  # Stripping the URL for use in the new dictionary
    if original_url.startswith('chrome:'):
        return jsonify({'message': 'Chrome URL ignored!'}), 200
    print("currently viewing: " + stripped_url)
    parent_url = stripped_url
    parent_url2 = stripped_url2

    global url_timestamp
    global url_timestamp2
    global url_viewtime
    global url_viewtime_stripped  # Declare the new dictionary
    global prev_url
    global prev_url2

    #print("initial db prev tab: ", prev_url)
    #print("initial db timestamp: ", url_timestamp)
    #print("initial db viewtime: ", url_viewtime)

    if parent_url not in url_timestamp.keys():
        url_viewtime[parent_url] = 0

    if prev_url != '':
        time_spent = int(time.time() - url_timestamp[prev_url])
        url_viewtime[prev_url] = url_viewtime[prev_url] + time_spent

    #Second dictionary
    if parent_url2 not in url_timestamp2.keys():
            url_viewtime_stripped[parent_url2] = 0
    if prev_url2 != '':
        time_spent2 = int(time.time() - url_timestamp2[prev_url2])
        url_viewtime_stripped[prev_url2] = url_viewtime_stripped[prev_url2] + time_spent2

    x = int(time.time())
    url_timestamp[parent_url] = x
    prev_url = parent_url
    url_timestamp2[parent_url2] = x
    prev_url2 = parent_url2
    #print("final timestamps: ", url_timestamp)
    #print("final viewtimes: ", url_viewtime)
    print("final viewtimes2: ", url_viewtime_stripped)
    totaltime = sum(list(url_viewtime.values()))
    totaltime_hrsminsec = time.strftime("%H:%M:%S", time.gmtime(totaltime))
    print("Total time: ", totaltime_hrsminsec)

    # Write to CSV file with error handling
    try:
        with open('website_time_spent.csv', mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Website', 'Time Spent (seconds)'])
            for key, value in url_viewtime.items():
                if value != 0:  # Filter out entries with value 0
                    writer.writerow([key, value])
    except Exception as e:
        print("Error writing to CSV file:", e)

    
    # Now use url_viewtime_stripped for matching with the dataset
    for stripped_url2, time_spent2 in url_viewtime_stripped.items():
        print(stripped_url2)
        print(time_spent2)
        category = dataset.get(stripped_url2)
        print(category)
        if category:
            if category in category_total_time:
                timetemp = category_total_time[category] + time_spent2
                category_total_time[category] = timetemp
                url_viewtime_stripped[stripped_url2] = 0
            else:
                category_total_time[category] = time_spent2
        else:
            print("Category not found for", stripped_url2)  # Print if category not found
        print(category_total_time)
    # Output category total time
    print("Category Total Time:", category_total_time)

    try:
        with open('Category_time_spent.csv', mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Category', 'Time Spent (seconds)'])
            for key, value in category_total_time.items():
                writer.writerow([key, value])
    except Exception as e:
        print("Error writing to CSV file:", e)

    return jsonify({'message': 'success!', 'category': category}), 200

@app.route('/quit_url', methods=['POST'])   
def quit_url():
    resp_json = request.get_data()
    print("Url closed: " + resp_json.decode())
    return jsonify({'message': 'quit success!'}), 200

@app.route('/get_viewtime', methods=['GET'])
def get_viewtime():
    return jsonify(url_viewtime)

@app.route('/get_total_time', methods=['GET'])
def get_total_time():
    total_time_seconds = sum(url_viewtime.values())
    total_hours, remainder = divmod(total_time_seconds, 3600)
    total_minutes, total_seconds = divmod(remainder, 60)
    formatted_time = "{:02d} : {:02d} : {:02d}".format(total_hours, total_minutes, total_seconds)
    return jsonify({'total_time': formatted_time})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)