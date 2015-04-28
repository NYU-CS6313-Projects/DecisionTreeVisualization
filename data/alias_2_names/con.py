import csv
import json


with open("output_original.csv") as f:
	csvReader = csv.reader(f)
	list1 = []
	for row in csvReader:
		for i in row:
			a = i.replace("info__","",1)
			b = a.replace("diagnosis__","",1)
			c = b.replace("procedure__","",1)
			list1.append(c)		
		break


list2 = []
with open('headers.json') as data_file:
	data = json.load(data_file)
	data1 = data["info"]
	data2 = data["diagnosis"]
	data3 = data["procedure"]

for i in list1:
	if i in data1.keys():
		list2.append(data1[i]["name"])
	elif i in data2.keys():
		list2.append(data2[i]["name"])
	elif i in data3.keys():
		list2.append(data3[i]["name"])
	else:
		list2.append(i)

out = csv.writer(open("headers.csv","w"), delimiter=',',quoting=csv.QUOTE_ALL)
out.writerow(list2)
#print len(list2)
#print len(list1)

