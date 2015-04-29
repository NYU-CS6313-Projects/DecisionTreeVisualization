import csv
import json

def findall(v, k):
	i = 0
	if type(v) == type({}):
		for k1 in v:
			if k1 == k:
				print int(v[k1])
				i = i+1
			findall(v[k1],k)
	return i



with open('data.json') as data_file:
	data = json.load(data_file)

list_of_nodes = findall(data,"id")
print list_of_nodes
