from flask import Flask, request, jsonify, make_response
from flask_restplus import Api, Resource, fields

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer

import numpy as np
import pandas as pd
import nltk

from preprocess import PreProcess

flask_app = Flask(__name__)
app = Api(app = flask_app, 
		  version = "1.0", 
		  title = "The Reviewer", 
		  description = "Sentiment analysis on product reviews using machine learning.")

name_space = app.namespace('prediction', description='Prediction APIs')

model = app.model('Prediction params', 
				  {'review': fields.String(required = True, 
				  							   description="Text containing the review of movies", 
    					  				 	   help="Text review cannot be blank")})

classifier = joblib.load('recommendation_clf.joblib')
vectorizer = joblib.load('tfidf_vectorizer.joblib')


@name_space.route("/")
class MainClass(Resource):

	def options(self):
		response = make_response()
		response.headers.add("Access-Control-Allow-Origin", "*")
		response.headers.add('Access-Control-Allow-Headers', "*")
		response.headers.add('Access-Control-Allow-Methods', "*")
		return response

	@app.expect(model)		
	def post(self):
		try: 
			formData = request.json
			#print(formData)
			#print('review:', formData['review'])
			#data = [val for val in formData.values()]
			#data = [clean_text(formData['review'])]
			data = pd.DataFrame([formData['review']], columns=['Document'])
			# Cleaning text
			pre_processor = PreProcess(data, column_name='Document')
			data = pre_processor.clean_html()
			data = pre_processor.remove_non_ascii()
			data = pre_processor.remove_spaces()
			data = pre_processor.remove_punctuation()
			data = pre_processor.stemming()
			data = pre_processor.lemmatization()
			data = pre_processor.stop_words()
			
			# Vectorizing and passing through classifier
			vec_data = vectorizer.transform(data.Document)
			prediction = classifier.predict(vec_data)
			label = { 0: "Not Recommended", 1: "Recommended"}
			response = jsonify({
				"statusCode": 200,
				"status": "Prediction made",
				"result": "Prediction: " + label[prediction[0]] + " (" + str(np.round(np.max(classifier.predict_proba(vec_data)),2)*100) + "%)"
				})
			response.headers.add('Access-Control-Allow-Origin', '*')
			return response
		except Exception as error:
			return jsonify({
				"statusCode": 500,
				"status": "Could not make prediction",
				"error": str(error)
			})