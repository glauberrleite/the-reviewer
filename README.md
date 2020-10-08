# The Reviewer
The Reviewer is a web platform for games reviews that automatically extracts informations like recommendation and helpfulness based only on its text.

## What is underneath?
If you see the files in this repository, you can see that are some interesting things happening. First, we have a file named *steam_reviews.csv*, it's a dataset of 10573 reviews made by real users in the Steam game store. That file includes not just the review, but **recommendation** status and other flags, like **helpful** and **funny**.

In a python notebook *training.ipynb* we can read and clean that data using the Natural Language Toolkit **nltk**, then produce **TF-IDF** vectorizers and classifiers for recommendation, helpful and funny estimates using **SVM** and **KNN** algorithms from scikit-learn.

These vectorizers and classifier were exported to *joblib* files, so a **flask** API could be implemented, offering predictions through HTTP requests. Also, that API persists new reviews made in system using **pandas** dataframes. Finnaly, a **React-Bootstrap** responsive front-end was developed to iterate with the flask API. There, a user can choose a game title, write a review, send it to the API and see its resulting predictions.

## How to make it work?
This project is encapsulated in docker containers and run with docker-compose. To run locally, one just needs to clone this repository, build the images using:

`$ docker-compose build`

having created the images, run the servers using:

`$ docker-compose up`