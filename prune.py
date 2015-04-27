import numpy as np
import scipy as sp
import sklearn
import csv
import json

def read(file):
	data = []
	c = 0
	with open(file, 'rU') as f:  #opens PW file
	    reader = csv.reader(f)
	    for row in reader:
	    	if c == 0:
	    		head = row
	    		c = 1
	    	else:
	    		data.append(row)
	# print len(data)
	data = np.asarray(data)
	# print data_arr.shape

	data = data[1:5000,:]

	# numFeatures = len(head)
	# numInstances = len(data)

	# feature contains all the covariates, feature_dct: feature_name: the column_position of the feature
	feature = head[2:]
	feature_id = np.arange(len(feature))
	feature_dct = dict(zip(feature,feature_id))


	### delect the first attribute, 'id', attributes contains all the attributes need to fit the model
	splilt = data[:,0]

	### select the test and train dataset according to the 'test'. '1' = test, '0' = train
	Xtrain = data[splilt=='0',2:]
	ytrain = data[splilt=='0',1]
	Xtest = data[splilt =='1',2:]
	ytest = data[splilt =='1',1]
	# print feature_dct

	return Xtrain, ytrain, Xtest, ytest, feature_dct 




if __name__ == '__main__':
	Xtrain, ytrain, Xtest, ytest, feature_dct = read('output.csv')

	tree_json = json.load(open('./data/ourTree.json'))


	# print tree_json

	for key in tree_json.iterkeys():
	    print key

	print tree_json['right']['right']

