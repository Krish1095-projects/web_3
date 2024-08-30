from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
import urllib.parse

app = Flask(__name__)

def fact_check_claim_on_snopes(claim='COVID-19 is good'):
    try:
        # Split the claim into individual words
        words = claim.split()

        # Encode each word for URL
        encoded_words = [urllib.parse.quote_plus(word) for word in words]

        # Construct the search URL for Snopes
        search_url = "https://www.snopes.com/search/" + "%20".join(encoded_words) + "/"

        # Send a GET request to Snopes
        response = requests.get(search_url)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the HTML content of the search results page
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the first search result div
        search_result_div = soup.find('div', class_='article_wrapper')

        if search_result_div:
            # Extract article title
            article_title = search_result_div.find('h3', class_='article_title').text.strip()

            # Extract author name
            author_name = search_result_div.find('span', class_='author_name').text.strip()

            # Extract date and time posted
            date_time_posted = search_result_div.find('span', class_='article_date').text.strip()

            # Extract article URL
            article_url = search_result_div.find('input', id='article_url_0')['value']

            # Get fact-check details from the article URL
            fact_check_details = get_fact_check_details(article_url)

            return {
                "article_title": article_title,
                "author_name": author_name,
                "date_time_posted": date_time_posted,
                "article_url": article_url,
                "rating_title": fact_check_details["rating_title"],
                "claim": fact_check_details["claim"]
            }
        else:
            return "No fact-checking information found on Snopes.com."

    except requests.exceptions.RequestException as e:
        print("Error:", e)
        return "An error occurred while retrieving fact-checking information on Snopes.com."


def get_fact_check_details(article_url):
    try:
        # Send a GET request to the article URL
        response = requests.get(article_url)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the HTML content of the article page
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract rating title
        rating_title_wrap = soup.find('div', class_='rating_title_wrap')
        rating_title = rating_title_wrap.text.strip().split('\n')[0] if rating_title_wrap else None

        # Extract claim
        claim_cont = soup.find('div', class_='claim_cont')
        claim = claim_cont.text.strip() if claim_cont else None

        return {
            "rating_title": rating_title,
            "claim": claim
        }

    except requests.exceptions.RequestException as e:
        print("Error:", e)
        return "An error occurred while retrieving fact-check details."
