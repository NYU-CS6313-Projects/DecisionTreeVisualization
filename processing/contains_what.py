#### Xinyu Wang, CUSP, Sunny, 04/29/2015 #### 

import numpy as np
import scipy as sp
import sklearn
import csv
import scipy as sp
import json
import math
import collections
from scipy import stats 
from pprint import pprint
from copy import deepcopy


def read(file):
	data = []
	c = 0
	with open(file, 'rU') as f:  
	    reader = csv.reader(f)
	    for row in reader:
	    	if c == 0:
	    		head = row
	    		c = 1
	    	else:
	    		data.append(row)
	data = np.asarray(data)

	feature = head[1:]
	feature_id = np.arange(len(feature))
	feature_dct = dict(zip(feature,feature_id))

	train = data[data[:,0]=='0',1:].astype(int)
	test = data[data[:,0] =='1',1:].astype(int)
	return train, test, feature_dct

### entropy id left right samples##
### criterion id impurity samples value

def travel(dct, data, name_dct, indent=''):
	ind = indent + '  '
	if 'impurity' not in dct:
		if 'left' in dct:
			print ind + 'left' + dct['left']['id']
			v = dct['left']
			idx = name_dct[dct['rule'][:-10]]
			print dct['rule'][:-10]
			print idx
			to_left = data[data[:,idx]<0.5]
			v['which'] = to_left[:,-1].tolist()
			v['truth'] = to_left[:,1].tolist()
			unique, counts = np.unique(to_left[:,0], return_counts=True)	
			print unique,counts
			# print v['truth']
			if unique[0] == 1:
				unique = np.insert(unique,0,0)
				counts = np.insert(counts,0,0)
				v[unique[0]] = counts[0] 
			v[unique[0]] = counts[0] 
			try:
				v[unique[1]] = counts[1]
			except:
				unique = np.append(unique,1)
				v[unique[1]] = 0
			dct['left'] = travel(v, to_left, name_dct, ind)
		if 'right' in dct:
			print ind + 'right' + dct['right']['id']
			v = dct['right']
			idx = name_dct[dct['rule'][:-10]]
			to_right = data[data[:,idx]>=0.5]
			v['which'] = to_right[:,-1].tolist()
			v['truth'] = to_right[:,1].tolist()
			unique, counts = np.unique(to_right[:,0], return_counts=True)	
			print unique
			if unique[0] == 1:
				unique = np.insert(unique,0,0)
				counts = np.insert(counts,0,0)
				v[unique[0]] = counts[0] 
			v[unique[0]] = counts[0] 
			try:
				v[unique[1]] = counts[1]
			except:
				unique = np.append(unique,1)
				v[unique[1]] = 0
			dct['right'] = travel(v, to_right, name_dct, ind)
	return dct

if __name__ == '__main__':
	with open('tree_19_node.json') as data_file:    	
		dct = json.load(data_file)

	train, test, n_to_p_dct,= read('output.csv')
	ytrain = train[:,0]

	idd = np.arange(train.shape[0]).reshape(train.shape[0],1)

	train_with_id = np.hstack([train,idd])
	dct['which'] = idd.tolist()
	dct['truth'] = ytrain.tolist()
	unique, counts = np.unique(ytrain, return_counts=True)	
	dct[unique[0]] = counts[0] 
	dct[unique[1]] = counts[1]
 

	d = travel(dct,train_with_id, n_to_p_dct)
	with open('20depth_all_data.json', 'wb') as fp:
		json.dump(d, fp)
	# # 