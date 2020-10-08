from flask import Flask, request, jsonify, make_response, Response
from flask_restplus import Api, Resource, fields

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer

import numpy as np
import pandas as pd
import nltk
import json

from preprocess import PreProcess

flask_app = Flask(__name__)
app = Api(app = flask_app, 
		  version = "1.0", 
		  title = "The Reviewer", 
		  description = "Information extraction on game reviews using machine learning.")

name_space = app.namespace('prediction', description='Prediction APIs')

model = app.model('Prediction params', 
				  {'review': fields.String(required = True, 
				  							   description="Text containing the review", 
    					  				 	   help="Text review can not be blank")},
				  {'title': fields.String(required = True, 
				  							   description="Game title", 
    					  				 	   help="Game title can not be blank")})

name_space_query = app.namespace('query', description='Query APIs')
model_query = app.model('Query params', 
				  {'title': fields.String(required = True, 
				  							   description="Game title", 
    					  				 	   help="Title can not be blank")})								

classifier = joblib.load('recommendation_clf.joblib')
vectorizer = joblib.load('tfidf_vectorizer.joblib')
classifier_helpful = joblib.load('helpful_clf.joblib')
vectorizer_helpful = joblib.load('tfidf_vectorizer_helpful.joblib')
classifier_funny = joblib.load('funny_clf.joblib')
vectorizer_funny = joblib.load('tfidf_vectorizer_funny.joblib')


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
			reviews = pd.read_csv('reviews.csv')
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

			vec_data_helpful = vectorizer_helpful.transform(data.Document)
			prediction_helpful = classifier_helpful.predict(vec_data_helpful)
			
			vec_data_funny = vectorizer_funny.transform(data.Document)
			prediction_funny = classifier_funny.predict(vec_data_funny)

			# Add row to dataframe and csv
			new_row = {'title': formData['title'], 'funny': prediction_funny[0], 'funny_score': np.round(np.max(classifier_funny.predict_proba(vec_data_funny)),2), 'helpful': prediction_helpful[0], 'helpful_score': np.round(np.max(classifier_helpful.predict_proba(vec_data_helpful)),2), 'recommendation': prediction[0], 'recommendation_score': np.round(np.max(classifier.predict_proba(vec_data)),2), 'review': formData['review']}
			reviews = reviews.append(new_row, ignore_index=True)
			reviews.to_csv('reviews.csv', index=False, header=True)

			label = { 0: "Not Recommended", 1: "Recommended"}
			label_helpful = { 0: "Not so helpful", 1: "Helpful"}
			label_funny = { 0: "Not so funny", 1: "Funny"}

			data = reviews[reviews['title']==formData['title']]
			response = '{"statusCode": 200, "status": "Query made", "result": "' + label[prediction[0]] + " - " + str(np.round(np.max(classifier.predict_proba(vec_data)),2)*100) + "% " + "; " + label_helpful[prediction_helpful[0]] + " - " + str(np.round(np.max(classifier_helpful.predict_proba(vec_data_helpful)),2)*100) + "%" + "; " + label_funny[prediction_funny[0]] + " - " + str(np.round(np.max(classifier_funny.predict_proba(vec_data_funny)),2)*100) + "%" + '", "query": ' + data.to_json(orient='records') + '}'
			#response = jsonify({
			#	"statusCode": 200,
			#	"status": "Prediction made",
			#	"result": label[prediction[0]] + " - " + str(np.round(np.max(classifier.predict_proba(vec_data)),2)*100) + "% " + "; " + label_helpful[prediction_helpful[0]] + " - " + str(np.round(np.max(classifier_helpful.predict_proba(vec_data_helpful)),2)*100) + "%" + "; " + label_funny[prediction_funny[0]] + " - " + str(np.round(np.max(classifier_funny.predict_proba(vec_data_funny)),2)*100) + "%"
			#	})
			response = Response(json.dumps(json.loads(response)), mimetype='application/json')
			response.headers.add('Access-Control-Allow-Origin', '*')
			return response
		except Exception as error:
			return jsonify({
				"statusCode": 500,
				"status": "Could not make prediction",
				"error": str(error)
			})

@name_space_query.route("/")
class MainClass(Resource):

	def options(self):
		response = make_response()
		response.headers.add("Access-Control-Allow-Origin", "*")
		response.headers.add('Access-Control-Allow-Headers', "*")
		response.headers.add('Access-Control-Allow-Methods', "*")
		return response

	@app.expect(model_query)		
	def post(self):
		try:
			reviews = pd.read_csv('reviews.csv')
			formData = request.json
			data = reviews[reviews['title']==formData['title']]
			
			response = '{"statusCode": 200, "status": "Query made", "result": ' + data.to_json(orient='records') + '}'
			#response = jsonify({
			#	"statusCode": 200,
			#	"status": "Query made",
			#	"result": [data.to_json(orient='records')]
			#	})
			response = Response(json.dumps(json.loads(response)), mimetype='application/json')
					
			response.headers.add('Access-Control-Allow-Origin', '*')
			return response
		except Exception as error:
			return jsonify({
				"statusCode": 500,
				"status": "Could not make query",
				"error": str(error)
			})