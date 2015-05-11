
import sklearn
import csv
import json
import StringIO
import pydot
import numpy as np
import scipy as sp
import matplotlib.pyplot as plt
from sklearn import tree
from sklearn.tree import export_graphviz
from sklearn.metrics import accuracy_score
from sklearn.cross_validation import KFold
from sklearn.cross_validation import ShuffleSplit
from sklearn.cross_validation import train_test_split
from IPython.display import Image

### reading csv file into list of lists, header and main body of the data

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
  feature = head[2:]
  feature_id = np.arange(len(feature))
  feature_dct = dict(zip(feature,feature_id))
  position_dct = dict(zip(feature_id,feature))
  train = data[data[:,0]=='0'].astype(int)
  test = data[data[:,0] =='1'].astype(int)
  return train, test, feature, feature_dct, position_dct

def depth_cv(Xtrain,ytrain):
  kfold = KFold(Xtrain.shape[0], n_folds=10)
  accs = []
  max_depths = range(1, 100)
  for max_depth in max_depths:
      k_accs = []
      for train, test in kfold:
          Xtrain1, Xtest1, ytrain1, ytest1 = Xtrain[train], Xtrain[test], ytrain[train], ytrain[test]
          clf = tree.DecisionTreeClassifier(max_depth=max_depth)
          clf.fit(Xtrain, ytrain)
          ypred = clf.predict(Xtest)
          k_accs.append(accuracy_score(ytest, ypred))
      accs.append(np.mean(k_accs))
  plt.plot(max_depths, accs, linewidth=2.5)
  plt.show()

def build_tree(Xtrain, ytrain, Xtest,ytest):
  clf = tree.DecisionTreeClassifier(criterion='entropy', min_samples_leaf = 1, max_depth=20, max_leaf_nodes=25)
  clf = clf.fit(Xtrain, ytrain)
  myPredictions = clf.predict(Xtest)
  correctClass = accuracy_score(ytest, myPredictions)
  print correctClass
  dot_data = StringIO.StringIO()
  tree.export_graphviz(clf, out_file=dot_data)
  graph = pydot.graph_from_dot_data(dot_data.getvalue())
  graph.write_pdf("sometry.pdf")
  return clf

def viz(decision_tree, feature_names=None):
  from warnings import warn
 
  js = ""
 
  def node_to_str(tree, node_id, criterion):
    if not isinstance(criterion, sklearn.tree.tree.six.string_types):
      criterion = "impurity"
 
    value = tree.value[node_id]
    if tree.n_outputs == 1:
      value = value[0, :]
 
    if tree.children_left[node_id] == sklearn.tree._tree.TREE_LEAF:
      return '"id": "%s", "criterion": "%s", "impurity": "%s", "samples": "%s", "rule": "%s"' \
             % (node_id, 
                criterion,
                tree.impurity[node_id],
                tree.n_node_samples[node_id],
                value)
    else:
      if feature_names is not None:
        feature = feature_names[tree.feature[node_id]]
      else:
        feature = tree.feature[node_id]
 
      return '"id": "%s", "rule": "%s <= %.4f", "%s": "%s", "samples": "%s"' \
             % (node_id, 
                feature,
                tree.threshold[node_id],
                criterion,
                tree.impurity[node_id],
                tree.n_node_samples[node_id])
 
  def recurse(tree, node_id, criterion, parent=None, depth=0):
    tabs = "  " * depth
    js = ""
 
    left_child = tree.children_left[node_id]
    right_child = tree.children_right[node_id]
 
    js = js + "\n" + \
         tabs + "{\n" + \
         tabs + "  " + node_to_str(tree, node_id, criterion)
 
    if left_child != sklearn.tree._tree.TREE_LEAF:
      js = js + ",\n" + \
           tabs + '  "left": ' + \
           recurse(tree, \
                   left_child, \
                   criterion=criterion, \
                   parent=node_id, \
                   depth=depth + 1) + ",\n" + \
           tabs + '  "right": ' + \
           recurse(tree, \
                   right_child, \
                   criterion=criterion, \
                   parent=node_id,
                   depth=depth + 1)
 
    js = js + tabs + "\n" + \
         tabs + "}"
 
    return js
 
  if isinstance(decision_tree, sklearn.tree.tree.Tree):
    js = js + recurse(decision_tree, 0, criterion="impurity")
  else:
    js = js + recurse(decision_tree.tree_, 0, criterion=decision_tree.criterion)
 
  return js

def stat(clf):
  ## number of nodes
  num_nodes = clf.tree_.node_count
  ## value of depth
  depth = clf.tree_.max_depth
  names = clf.tree_.feature_names
  importance = clf.feature_importances_ 

  itemindex = np.where(importance == max(importance))

def travel(dct, data, name_dct):
  keys = dct.keys()
  for k, v in dct.iteritems():
    if k == 'right':
      try:
        idx = name_dct[dct[keys[1]][:-10]]+1
      except:
        idx = name_dct[dct[keys[2]][:-10]]+1    
      to_right = data[data[:,idx]>=0.5]
      v['which'] = to_right[:,-1].tolist()
      travel(v,to_right, name_dct)
    if k == 'left':
      try:
        idx = name_dct[dct[keys[1]][:-10]]+1
      except:
        idx = name_dct[dct[keys[2]][:-10]]+1
      to_left = data[data[:,idx]<0.5]
      v['which'] = to_left[:,-1].tolist()
      travel(v, to_left, name_dct)
  return dct

if __name__ == '__main__':
  train, test, feature, feature_dct, position_dct = read('output.csv')
  
  Xtrain = train[:,2:]
  ytrain = train[:,1]
  Xtest = test[:,2:]
  ytest = test[:,1]
  
  clf = build_tree(Xtrain, ytrain, Xtest,ytest)
  # stat(clf)
  str1 = viz(clf, feature_names=feature)
  # print str1

<<<<<<< HEAD
  obj = open('tree_25_node_data.json', 'wb')
=======
  obj = open('tree_25_node.json', 'wb')
>>>>>>> origin/master
  obj.write(str1)
  obj.close

  # with open('tree.json') as data_file:     
    # data = json.load(data_file)


    
  # data = json.loads(str1)

  # idd = np.arange(train.shape[0]).reshape(train.shape[0],1)
  # train_with_id = np.hstack([train,idd])
  # data['which'] = idd.tolist()

  # d = travel(data,train_with_id, feature_dct)
  # with open('tree_contains.json', 'wb') as fp:
  #   json.dump(d, fp)
