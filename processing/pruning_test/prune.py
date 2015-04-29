#### Xinyu_Wang 2015.04.26. Cloudy, New York, Home.####
#### Xinyu_Wang 2015.04.27. Sunny, New York, MetroTech 6. ####

import numpy as np
import scipy as sp
import sklearn
import csv
import scipy as sp
import json
import math
import collections
from scipy import stats 


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
	data = np.asarray(data)

	data = data[1:5000,:]

	feature = head[2:]
	feature_id = np.arange(len(feature))
	feature_dct = dict(zip(feature,feature_id))
	position_dct = dict(zip(feature_id,feature))



	train = data[data[:,0]=='0',1:].astype(int)
	test = data[data[:,0] =='1',1:].astype(int)
	return train, test, feature_dct, position_dct

def delete_leaf(train, test, tree, keys, feature):
	### the leaf here refers to those in the top of the tree, not in the middle layers
	### the fuction returen the new class of the partent of the leafs
	
	# the postion of the root node
	n0 = tree_json['rule'][:-10]
	p0 = feature_dct[n0]
	#### some how the root node need to be the p0+3
	key_0 = 29
	X = train
	X1 = X


	# according to the root, splite the data into two parts
	to_right = X[X[:,key_0]>=0.5]
	to_left = X[X1[:,key_0]<0.5]
	
	# following the keys to get the position of the leaf's parent as well as go through the data that should fall into the parent
	for i in range(len(keys)-1):
		if i == 0:
			data = tree_json[keys_leaf[i]]
		else :
			data = data[keys_leaf[i]]
		key_p = feature[data['rule'][:-10]]
		key_p = key_p + 3
		# print key_p
		if keys[i] == 'right':
			to_right1 = to_right
			to_right = to_right[to_right1[:,key_p] >=0.5]
			to_left = to_right1[to_right1[:,key_p] < 0.5]
			# print len(to_left)
			# print len(to_right)
		if keys[i] == 'left':
			to_left1 = to_left
			to_right = to_left[to_left1[:,key_p] >=0.5]
			to_left = to_left1[to_left1[:,key_p] < 0.5]
		# print len(to_left)
		# print len(to_right)
	if keys[-2] =='right':
		unique, counts = np.unique(to_right[:,-1], return_counts=True)
	if keys[-2] =='left':
		unique, counts = np.unique(to_left[:,-1], return_counts=True)
	new_class = counts.argmax()
	return new_class 

def add_leaf(train,test,tree,keys,feature):
	pass
def delete_layer():
	### for this part, rerun the scipy decision tree with the newmaxdepth
	pass

def Tree():
    return collections.defaultdict(Tree)

def delete_branch(train, test, tree, keys, n_to_p_dct, p_to_n_dct, max_depth):
	tree_dct = {}
	keys
	n0 = tree_json['rule'][:-10]
	p0 = n_to_p_dct[n0]
	#### some how the root node need to be the p0+3
	key_0 = 29
	X = train
	X1 = X
	key_used =[n0]
	# according to the root, splite the data into two parts
	to_right = X[X[:,key_0]>=0.5]
	to_left = X[X1[:,key_0]<0.5]


	# following the keys to get the position of the leaf's parent as well as go through the data 
	# that should fall into the parent
	for i in range(len(keys)-2):
		if i == 0:
			data = tree_json[keys_leaf[i]]
		else :
			data = data[keys_leaf[i]]
		key_p = n_to_p_dct[data['rule'][:-10]]
		key_p = key_p + 3
		# key_used.append(key_p)
		# print key_p
		key_used.append(data['rule'][:-10])
		if keys[i] == 'right':
			to_right1 = to_right
			to_right = to_right[to_right1[:,key_p] >=0.5]
			to_left = to_right1[to_right1[:,key_p] < 0.5]
			# print len(to_left)
			# print len(to_right)
		if keys[i] == 'left':
			to_left1 = to_left
			to_right = to_left[to_left1[:,key_p] >=0.5]
			to_left = to_left1[to_left1[:,key_p] < 0.5]
	# print len(to_left)	
	# print len(to_right)
	

	# print key_used
	# the number of layers that need to be build

	if keys[-2] == 'right':
		data = to_right
	if keys[-2] == 'left':
		data = to_left
	


	layers = max_depth + 1 - len(keys)
	tree_dct = Tree()
	for i in range(layers):
		if i == 0:
			tree_dct[i] = key_used[i]
		else:
			# tree_dct[i] = 
			pass


	print tree_dct







	# def H(keys):
# 	### keys shoule be a list of key, indicating the position of a node in the tree
# 	
	#unique, counts = np.unique(ytrain, return_counts=True)
# 	counts = counts.astype(float)
# 	counts = counts/len(ytrain)
# 	pro_dct = dict(zip(unique,counts))

# 	e_part1 = -pro_dct[0]*(math.log(pro_dct[0])/math.log(2))
# 	e_part2 = -pro_dct[1]*(math.log(pro_dct[1])/math.log(2))

# 	e0 = e_part1+e_part2
# 	print e0


# def IG(keys):
# 	### keys shoule be a list of key, indicating the position of a node in the tree
	
# 	n0 = tree_json['rule'][:-10]
# 	p0 = feature_dct[n0]
# 	c = -1
# 	i_best = 100.
# 	c_best = 0

# 	# p0=28
# 	# print p0
# 	for p0 in range(Xtrain.shape[1]):
# 		test_r = ytrain[Xtrain[:,p0]>=0.5]
# 		test_l = ytrain[Xtrain[:,p0]<0.5]
# 		c += 1
# 		entropy = []
# 		for side in [test_l,test_r]:
# 			unique, counts = np.unique(side, return_counts=True)
# 			counts = counts.astype(float)
# 			counts = counts/len(side)
# 			pro_dct = dict(zip(unique,counts))

# 			e_part1 = -pro_dct[0]*(math.log(pro_dct[0])/math.log(2))
# 			e_part2 = -pro_dct[1]*(math.log(pro_dct[1])/math.log(2))
# 			e = e_part1+e_part2
# 			# print e
# 			entropy.append(e)
# 				# print entropy
# 		e_new = (len(test_l)*entropy[0] + len(test_r) * entropy[1])/len(ytrain)
# 			# print
# 		i_gain = e_new
# 		print i_gain
# 		# print i_gain
# 		if i_gain < i_best:
# 			i_best = i_gain
# 			c_best = c
# 	print i_best, c_best 

	return tree_dct

if __name__ == '__main__':
	train,test, n_to_p_dct, p_to_n_dct= read('output.csv')
	Xtrain = train[:,1:]
	ytrain = train[:,0]
	Xtest = test[:,1:]
	ytest = test[:,0]

	#### read the json file, the file contains the structure of the tree:
	#### include the attributes that split the node + number of the sample that contains in the node, the node is leaf or branch
	tree_json = json.load(open('test_tree.json'))

	#### keys for test
	keys =['right','left','right','left','left','left','left','left','left']  ## postion = 5
	keys_leaf=['right','left','right','left','left','left','left','left','left','left'] #0


	### delete leaf
	# new_class = delete_leaf(train,test,tree_json,keys_leaf,n_to_p_dct)
	### delete node (change attribute)
	tree_part = delete_branch(train,test,tree_json,keys,n_to_p_dct,p_to_n_dct,10)





# 	# gini_best= 10.
# 	# c = -1
# 	# p_best = 0
	# # for p0 in range(Xtrain.shape[1]):
	# # 	test_r = ytrain[Xtrain[:,p0]>=0.5]
	# # 	test_l = ytrain[Xtrain[:,p0]<0.5]
	# # 	# print len(test_r)
	# # 	# print len(test_l)
	# # 	c += 1
	# # 	gini = []
	# # 	for side in [test_l,test_r]:
	# # 		unique, counts = np.unique(side, return_counts=True)
	# # 		counts = counts.astype(float)
	# # 		counts = counts/len(side)
	# # 		gn = 1 - (counts[0]*counts[0] + counts[1]*counts[1])
	# # 		# print gn
	# # 		gini.append(gn)

	# # 	gini_new = (len(test_l)*gini[0] + len(test_r) * gini[1])/len(ytrain)
	# # 	# print gini_new
	# # 	if gini_new < gini_best:
	# # 		gini_best = gini_new
	# # 		p_best = c

	# print gini_best, p_best

