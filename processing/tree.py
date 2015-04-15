import numpy as np
import scipy as sp
import sklearn
import csv
import matplotlib.pyplot as plt
from sklearn.cross_validation import KFold
from sklearn.cross_validation import ShuffleSplit
from sklearn import tree
from sklearn.metrics import accuracy_score
from sklearn.cross_validation import train_test_split
from sklearn.tree import export_graphviz
from IPython.display import Image
# from sklearn.naive_bayes import GaussianNB
# from sklearn.metrics import precision_score
# from sklearn.metrics import roc_auc_score
# from sklearn.metrics import confusion_matrix
# from sklearn import cross_validation
import StringIO, pydot

### reading csv file into list of lists, header and main body of the data
data = []
c = 0
with open('output.csv', 'rU') as f:  #opens PW file
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

numFeatures = len(head)
numInstances = len(data)
# print numFeatures, numInstances


### delect the first attribute, 'id', attributes contains all the attributes need to fit the model
attributes = data[:,3:]
target = data[:,2]
# print attributes.shape
# print target.shape


### randomly pick up training set and testing set
Xtrain, Xtest, ytrain, ytest = train_test_split(attributes, target, train_size=666, test_size=333, random_state=42)

### build up the tree and using split-testing data to test
clf = tree.DecisionTreeClassifier(criterion='entropy', min_samples_leaf = 1, max_depth=20)
clf = clf.fit(Xtrain, ytrain)
# myPredictions = clf.predict(Xtest)
# correctClass = accuracy_score(ytest, myPredictions)
# print correctClass

dot_data = StringIO.StringIO()
export_graphviz(clf, out_file=dot_data)
print dot_data.getvalue()
graph = pydot.graph_from_dot_data(dot_data.getvalue())
graph.write_pdf("haha.pdf")

im = Image(graph.create_png())
print type(im)

### use cross validation to test the optimal depth of the tree
kfold = KFold(Xtrain.shape[0], n_folds=10)
accs = []
max_depths = range(1, 50)
for max_depth in max_depths:
    k_accs = []
    for train, test in kfold:
        Xtrain1, Xtest1, ytrain1, ytest1 = Xtrain[train], Xtrain[test], ytrain[train], ytrain[test]
        clf = tree.DecisionTreeClassifier(max_depth=max_depth)
        clf.fit(Xtrain, ytrain)
        ypred = clf.predict(Xtest)
        k_accs.append(accuracy_score(ytest, ypred))
    accs.append(np.mean(k_accs))
# plot the accuracies as a function of max_depth
plt.plot(max_depths, accs, linewidth=2.5)
plt.show()






